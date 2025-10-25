import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Divider,
  Card,
  CardBody,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon, UnlockIcon } from '@chakra-ui/icons';

const features = [
  {
    title: 'Free AI Models',
    description: 'Access to 5 powerful free models via OpenRouter',
    icon: UnlockIcon,
    color: 'green',
    isNew: true,
  },
  {
    title: 'DeepSeek V3.1',
    description: 'Latest DeepSeek model with enhanced reasoning',
    icon: StarIcon,
    color: 'blue',
    isNew: true,
  },
  {
    title: 'Conversation History',
    description: 'Save, export, and manage your AI conversations',
    icon: CheckCircleIcon,
    color: 'purple',
    isNew: true,
  },
  {
    title: 'Multiple Providers',
    description: 'Switch between OpenAI and OpenRouter seamlessly',
    icon: CheckCircleIcon,
    color: 'orange',
    isNew: true,
  },
  {
    title: 'Enhanced UI',
    description: 'Improved interface with better model selection',
    icon: CheckCircleIcon,
    color: 'teal',
    isNew: true,
  },
  {
    title: 'Export Capabilities',
    description: 'Export conversations as JSON or copy to clipboard',
    icon: CheckCircleIcon,
    color: 'pink',
    isNew: true,
  },
];

export const EnhancedFeatures: React.FC = () => {
  return (
    <Card bg="gray.800" borderColor="blue.500" borderWidth="1px">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color="blue.300">
              ⚡ Enhanced Features
            </Text>
            <Badge colorScheme="blue" variant="solid">
              v2.0
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color="gray.300">
            This enhanced version includes powerful new features and free AI model access:
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={3}>
            {features.map((feature, index) => (
              <Tooltip key={index} label={feature.description} placement="top">
                <Box
                  p={3}
                  bg="gray.700"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.600"
                  _hover={{ borderColor: `${feature.color}.400`, bg: "gray.650" }}
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={feature.icon} color={`${feature.color}.400`} />
                    <Text fontSize="sm" fontWeight="medium">
                      {feature.title}
                    </Text>
                    {feature.isNew && (
                      <Badge size="sm" colorScheme={feature.color} variant="subtle">
                        NEW
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Tooltip>
            ))}
          </SimpleGrid>

          <Divider />

          <Box p={3} bg="green.900" borderRadius="md" border="1px solid" borderColor="green.600">
            <HStack spacing={2} mb={2}>
              <Icon as={UnlockIcon} color="green.400" />
              <Text fontSize="sm" fontWeight="bold" color="green.300">
                Free Models Available
              </Text>
            </HStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="green.200">• DeepSeek V3.1 - Latest reasoning model</Text>
              <Text fontSize="xs" color="green.200">• DeepSeek R1 - Advanced problem solving</Text>
              <Text fontSize="xs" color="green.200">• GLM 4.5 Air - Fast and efficient</Text>
              <Text fontSize="xs" color="green.200">• TNG Chimera variants - Specialized models</Text>
            </VStack>
          </Box>

          <Text fontSize="xs" color="gray.400" textAlign="center">
            No API key required for free models • Enhanced with OpenRouter integration
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};