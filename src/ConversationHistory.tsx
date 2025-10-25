import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Divider,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { IAgent } from './Agent';
import { DownloadIcon, CopyIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';

interface ConversationEntry {
  id: string;
  timestamp: number;
  agent: IAgent;
  summary: string;
}

interface ConversationHistoryProps {
  currentAgent?: IAgent;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ currentAgent }) => {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationEntry | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const toast = useToast();

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('godmode_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, []);

  // Save current conversation when agent completes
  useEffect(() => {
    if (currentAgent && currentAgent.output.length > 0) {
      const summary = generateSummary(currentAgent);
      const entry: ConversationEntry = {
        id: currentAgent.id,
        timestamp: Date.now(),
        agent: currentAgent,
        summary,
      };

      setConversations(prev => {
        const updated = [entry, ...prev.filter(c => c.id !== currentAgent.id)].slice(0, 50); // Keep last 50
        try {
          localStorage.setItem('godmode_conversations', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save conversation:', error);
        }
        return updated;
      });
    }
  }, [currentAgent]);

  const generateSummary = (agent: IAgent): string => {
    if (agent.output.length === 0) return 'No conversation yet';
    
    const lastMessage = agent.output[agent.output.length - 1];
    const preview = lastMessage.content.slice(0, 100);
    return preview + (lastMessage.content.length > 100 ? '...' : '');
  };

  const exportConversation = (conversation: ConversationEntry) => {
    const exportData = {
      agent: conversation.agent.name,
      description: conversation.agent.description,
      goals: conversation.agent.goals,
      timestamp: new Date(conversation.timestamp).toISOString(),
      conversation: conversation.agent.output,
      tasks: conversation.agent.tasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `godmode-conversation-${conversation.agent.name}-${new Date(conversation.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Conversation Exported',
      description: 'The conversation has been downloaded as a JSON file.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const copyConversation = (conversation: ConversationEntry) => {
    const text = conversation.agent.output
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: 'The conversation has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('godmode_conversations', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save conversation history:', error);
      }
      return updated;
    });

    toast({
      title: 'Conversation Deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const clearAllConversations = () => {
    setConversations([]);
    localStorage.removeItem('godmode_conversations');
    toast({
      title: 'All Conversations Cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={onOpen}
        leftIcon={<ViewIcon />}
      >
        History ({conversations.length})
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            <HStack justify="space-between">
              <Text>Conversation History</Text>
              <Button size="sm" colorScheme="red" variant="ghost" onClick={clearAllConversations}>
                Clear All
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {conversations.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={8}>
                No conversations yet. Start a new agent to see history here.
              </Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {conversations.map((conversation) => (
                  <Box
                    key={conversation.id}
                    p={4}
                    bg="gray.700"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    <HStack justify="space-between" mb={2}>
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontWeight="bold" fontSize="sm">
                            {conversation.agent.name}
                          </Text>
                          <Badge colorScheme="blue" size="sm">
                            {conversation.agent.output.length} messages
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          {new Date(conversation.timestamp).toLocaleString()}
                        </Text>
                      </VStack>
                      <HStack spacing={1}>
                        <Tooltip label="View Details">
                          <IconButton
                            size="xs"
                            icon={<ViewIcon />}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              onViewOpen();
                            }}
                            aria-label="View conversation"
                          />
                        </Tooltip>
                        <Tooltip label="Copy to Clipboard">
                          <IconButton
                            size="xs"
                            icon={<CopyIcon />}
                            onClick={() => copyConversation(conversation)}
                            aria-label="Copy conversation"
                          />
                        </Tooltip>
                        <Tooltip label="Export as JSON">
                          <IconButton
                            size="xs"
                            icon={<DownloadIcon />}
                            onClick={() => exportConversation(conversation)}
                            aria-label="Export conversation"
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            size="xs"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => deleteConversation(conversation.id)}
                            aria-label="Delete conversation"
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" color="gray.300" noOfLines={2}>
                      {conversation.summary}
                    </Text>
                    <Divider mt={2} />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Goals: {conversation.agent.goals.join(', ')}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Conversation Detail Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" maxH="80vh">
          <ModalHeader>
            {selectedConversation && (
              <VStack align="start" spacing={1}>
                <Text>{selectedConversation.agent.name}</Text>
                <Text fontSize="sm" color="gray.400">
                  {new Date(selectedConversation.timestamp).toLocaleString()}
                </Text>
              </VStack>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto">
            {selectedConversation && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Description:</Text>
                  <Text fontSize="sm" color="gray.300">
                    {selectedConversation.agent.description}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Goals:</Text>
                  <VStack align="start" spacing={1}>
                    {selectedConversation.agent.goals.map((goal, index) => (
                      <Text key={index} fontSize="sm" color="gray.300">
                        • {goal}
                      </Text>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>Conversation:</Text>
                  <VStack spacing={3} align="stretch">
                    {selectedConversation.agent.output.map((message, index) => (
                      <Box
                        key={index}
                        p={3}
                        bg={message.role === 'user' ? 'blue.900' : 'gray.700'}
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderLeftColor={message.role === 'user' ? 'blue.400' : 'green.400'}
                      >
                        <Text fontSize="xs" color="gray.400" mb={1}>
                          {message.role.toUpperCase()}
                        </Text>
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {message.content}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {selectedConversation.agent.tasks.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={2}>Tasks Completed:</Text>
                      <VStack spacing={2} align="stretch">
                        {selectedConversation.agent.tasks.map((task, index) => (
                          <Box key={index} p={2} bg="gray.700" borderRadius="md">
                            <Text fontSize="sm" fontWeight="bold">
                              {task.task_name}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Command: {task.command_name}
                            </Text>
                            <Text fontSize="xs" color="gray.300" mt={1}>
                              {task.result}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};