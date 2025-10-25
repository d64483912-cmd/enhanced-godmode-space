import {
  useAuthState,
  useSignOut,
  useSignInWithGithub,
} from "react-firebase-hooks/auth";

import { godmode_auth } from "./firebase";
import {
  Box,
  Button,
  Card,
  Divider,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import SettingsModalContext from "./SettingsModalContext";
import { ISettings } from "./Agent";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  signInWithPopup,
} from "firebase/auth";
import { CheckIcon } from "@chakra-ui/icons";
import { OpenRouterService, FREE_MODELS } from "./OpenRouterService";

function isEmbeddedBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Detect Twitter in-app browser
  if (/Twitter/i.test(userAgent)) {
    return true;
  }

  // Detect other embedded browsers (WebView)
  if (/WebView/i.test(userAgent)) {
    return true;
  }

  // Add other specific checks for embedded browsers if needed
  // ...

  return false;
}

export const useAuthIsOK = () => {
  const { settings } = React.useContext(SettingsModalContext);

  const [user, loading] = useAuthState(godmode_auth);

  const authIsOk = user?.email ? user.emailVerified : !!user;

  // Allow access if user is authenticated OR has API keys OR using free OpenRouter models
  const hasApiAccess = settings.openAIKey || 
    (settings.useOpenRouter && (settings.openRouterKey || FREE_MODELS.some(m => m.id === settings.gptModel)));

  return !loading && (authIsOk || hasApiAccess);
};

export default function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [user, loading] = useAuthState(godmode_auth);

  const signInWithGoogle = useCallback(async () => {
    if (isEmbeddedBrowser()) {
      await signInWithRedirect(godmode_auth, new GoogleAuthProvider());
    } else {
      await signInWithPopup(godmode_auth, new GoogleAuthProvider());
    }
  }, []);

  useEffect(() => {
    getRedirectResult(godmode_auth);
  }, []);

  const [signOut] = useSignOut(godmode_auth);
  const [signInWithGithub] = useSignInWithGithub(godmode_auth);

  const { setSettings, settings } = React.useContext(SettingsModalContext);
  const [tempSettings, setTempSettings] = useState<ISettings>(settings);

  useEffect(() => {
    setTempSettings((s) => ({
      ...s,
      openAIKey: localStorage.getItem("openAIKey") || null,
    }));
  }, []);

  const updateSettings = useCallback(() => {
    tempSettings.openAIKey ||= null;
    tempSettings.openRouterKey ||= null;

    const newSettings = { ...settings, ...tempSettings };
    setSettings(newSettings);

    // Save to localStorage
    if (tempSettings.openAIKey)
      localStorage.setItem("openAIKey", tempSettings.openAIKey || "");
    else localStorage.removeItem("openAIKey");

    if (tempSettings.openRouterKey)
      localStorage.setItem("openRouterKey", tempSettings.openRouterKey || "");
    else localStorage.removeItem("openRouterKey");

    localStorage.setItem("useOpenRouter", String(tempSettings.useOpenRouter));
    localStorage.setItem("selectedProvider", tempSettings.selectedProvider);
    localStorage.setItem("gptModel", tempSettings.gptModel);
  }, [setSettings, settings, tempSettings]);

  const finish = useCallback(() => {
    updateSettings();
    onClose();
  }, [onClose, updateSettings]);

  useEffect(() => {
    // Auto-adjust model based on provider and available keys
    if (tempSettings.selectedProvider === 'openai') {
      if (!tempSettings.openAIKey && !["gpt-3.5-turbo", "gpt-4"].includes(tempSettings.gptModel)) {
        setTempSettings({
          ...tempSettings,
          gptModel: "gpt-3.5-turbo",
        });
      }
    } else if (tempSettings.selectedProvider === 'openrouter') {
      if (!FREE_MODELS.some(m => m.id === tempSettings.gptModel)) {
        setTempSettings({
          ...tempSettings,
          gptModel: "deepseek/deepseek-chat-v3.1:free",
        });
      }
    }
  }, [tempSettings]);

  const toasts = useToast();

  const checkKey = useCallback(async () => {
    if (tempSettings.selectedProvider === 'openai' && !tempSettings.openAIKey) return;
    if (tempSettings.selectedProvider === 'openrouter' && !tempSettings.openRouterKey && !FREE_MODELS.some(m => m.id === tempSettings.gptModel)) return;
    
    setKeyChecked(1);

    try {
      if (tempSettings.selectedProvider === 'openai') {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tempSettings.openAIKey,
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: 'say "yes"' }],
            model: tempSettings.gptModel,
            max_tokens: 3,
          }),
        });
        
        if (res.status === 200) {
          setKeyChecked(2);
        } else {
          const msg = (await res.json()).error.message as string;
          if (msg.includes("gpt-4")) {
            setTempSettings({ ...tempSettings, gptModel: "gpt-3.5-turbo" });
          } else {
            throw new Error(msg);
          }
        }
      } else if (tempSettings.selectedProvider === 'openrouter') {
        if (tempSettings.openRouterKey) {
          const service = new OpenRouterService(tempSettings.openRouterKey);
          const isValid = await service.validateApiKey();
          if (isValid) {
            setKeyChecked(2);
          } else {
            throw new Error("Invalid OpenRouter API key");
          }
        } else {
          // For free models, just check if the model is in the free list
          if (FREE_MODELS.some(m => m.id === tempSettings.gptModel)) {
            setKeyChecked(2);
          } else {
            throw new Error("Selected model is not available for free");
          }
        }
      }
    } catch (error) {
      toasts({
        title: "Key check failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        variant: "subtle",
        duration: 5000,
        isClosable: true,
      });
      setKeyChecked(0);
    }
  }, [toasts, tempSettings, setTempSettings]);

  const [keyChecked, setKeyChecked] = useState(0);
  useEffect(() => {
    setKeyChecked(0);
  }, [tempSettings.openAIKey, tempSettings.gptModel]);

  return (
    <Modal isOpen={isOpen} onClose={finish}>
      <ModalOverlay />
      <ModalContent bg="#151328">
        <ModalHeader>Authenticate</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Welcome to Godmode Enhanced
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700">
              Choose your AI provider to continue
            </Text>
            
            <Tabs 
              variant="enclosed" 
              w="full" 
              index={tempSettings.selectedProvider === 'openrouter' ? 0 : 1}
              onChange={(index) => setTempSettings({
                ...tempSettings,
                selectedProvider: index === 0 ? 'openrouter' : 'openai'
              })}
            >
              <TabList>
                <Tab>
                  OpenRouter <Badge ml={2} colorScheme="green">FREE</Badge>
                </Tab>
                <Tab>OpenAI</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
                      Use free AI models or bring your own OpenRouter API key
                    </Text>
                    
                    <FormControl>
                      <FormLabel fontSize="sm">Model Selection</FormLabel>
                      <Select
                        value={tempSettings.gptModel}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          gptModel: e.target.value,
                        })}
                      >
                        {FREE_MODELS.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">OpenRouter API Key (Optional)</FormLabel>
                      <Input
                        placeholder="sk-or-... (optional for free models)"
                        value={tempSettings.openRouterKey || ""}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          openRouterKey: e.target.value,
                        })}
                      />
                      <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                        Get your free API key at{" "}
                        <Link href="https://openrouter.ai" isExternal color="blue.300">
                          openrouter.ai
                        </Link>
                      </Text>
                    </FormControl>

                    <Button
                      w="full"
                      onClick={checkKey}
                      isLoading={keyChecked === 1}
                      colorScheme={keyChecked === 2 ? "green" : "blue"}
                      leftIcon={keyChecked === 2 ? <CheckIcon /> : undefined}
                    >
                      {keyChecked === 2 ? "Ready to Use" : "Validate Setup"}
                    </Button>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
                      Use OpenAI's models with your API key
                    </Text>
                    
                    <FormControl>
                      <FormLabel fontSize="sm">OpenAI API Key</FormLabel>
                      <Input
                        placeholder="sk-..."
                        value={tempSettings.openAIKey || ""}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          openAIKey: e.target.value,
                        })}
                      />
                      <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                        <Link
                          href="https://platform.openai.com/account/api-keys"
                          isExternal
                          color="blue.300"
                        >
                          Get your OpenAI key here
                        </Link>
                        . Make sure to enable billing.
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Model</FormLabel>
                      <Select
                        value={tempSettings.gptModel}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          gptModel: e.target.value,
                        })}
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        {tempSettings.openAIKey && (
                          <option value="gpt-4">GPT-4</option>
                        )}
                      </Select>
                    </FormControl>

                    <Button
                      w="full"
                      onClick={checkKey}
                      isLoading={keyChecked === 1}
                      colorScheme={keyChecked === 2 ? "green" : "blue"}
                      leftIcon={keyChecked === 2 ? <CheckIcon /> : undefined}
                    >
                      {keyChecked === 2 ? "Key Valid" : "Check Key"}
                    </Button>
                    
                    <Text
                      hidden={tempSettings.gptModel !== "gpt-4"}
                      color="whiteAlpha.700"
                      fontSize="xs"
                    >
                      Warning: GPT-4 is expensive. Set{" "}
                      <Link
                        color="blue.300"
                        href="https://platform.openai.com/account/billing/limits"
                        isExternal
                      >
                        usage limits
                      </Link>{" "}
                      to avoid unexpected charges.
                    </Text>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Divider />
            
            <Box hidden={!!user}>
              <Text fontSize="sm" color="whiteAlpha.700" textAlign="center" mb={3}>
                Or sign in to save your sessions
              </Text>
              <VStack spacing={2}>
                <Button
                  w="full"
                  onClick={() => signInWithGoogle()}
                  isLoading={loading}
                  colorScheme="blue"
                  size="sm"
                >
                  Sign in with Google
                </Button>
                <Button
                  w="full"
                  onClick={() => signInWithGithub()}
                  isLoading={loading}
                  colorScheme="gray"
                  size="sm"
                >
                  Sign in with GitHub
                </Button>
              </VStack>
            </Box>
            
            <Box hidden={!user}>
              <Text textAlign="center" mb={3}>Great! You're logged in.</Text>
              <Button w="full" onClick={() => signOut()} size="sm">
                Sign out
              </Button>
            </Box>
          </VStack>

          <Card
            mt={4}
            fontSize="sm"
            px={3}
            textAlign="center"
            py={3}
            bg="whiteAlpha.50"
            color="whiteAlpha.800"
          >
            <Text fontSize="xs">DM us for feedback or questions!</Text>
            <Text>
              <Link
                _hover={{ color: "twitter.500" }}
                textDecor="underline"
                href="https://twitter.com/da_fant"
                target="_blank"
              >
                @da_fant
              </Link>
            </Text>
            <Text>
              <Link
                _hover={{ color: "twitter.500" }}
                textDecor="underline"
                href="https://twitter.com/_Lonis_"
                target="_blank"
              >
                @_Lonis_
              </Link>
            </Text>
            <Text>
              <Link
                _hover={{ color: "twitter.500" }}
                textDecor="underline"
                href="https://twitter.com/emilahlback"
                target="_blank"
              >
                @emilahlback
              </Link>
            </Text>
          </Card>
        </ModalBody>
        <Divider w="full" mt={2} />
        <ModalFooter pt={3}>
          <Button colorScheme="blue" mr={3} onClick={finish}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
