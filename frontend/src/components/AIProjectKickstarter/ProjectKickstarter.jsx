import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AiOutlinePlus as PlusIcon,
  AiOutlineClockCircle as ClockIcon,
  AiOutlineEdit as PencilIcon,
  AiOutlineCheck as CheckIcon,
  AiOutlineClose as XMarkIcon,
  AiOutlineStar as SparklesIcon,
  AiOutlineRocket as RocketLaunchIcon,
  AiOutlineUser as UserIcon,
  AiOutlineRobot as CpuChipIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineFolder as FolderIcon,
  AiOutlineFile as FileIcon,
  AiOutlineCode as CodeIcon,
  AiOutlineDownload as DownloadIcon,
  AiOutlineEye as EyeIcon,
  AiOutlineExpand as ExpandIcon
} from 'react-icons/ai';
import { useGeminiAI } from '../../lib/geminiAI';
import { conversationManager } from '../../lib/conversationManager';

const ProjectKickstarter = ({ user, setShowMenu }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const titleInputRef = useRef(null);
  const { generateProjectSetup, isLoading: isAILoading } = useGeminiAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Memoize loadConversations to prevent unnecessary re-renders
  const loadConversations = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoadingConversations(true);
      const loadedConversations = await conversationManager.loadConversations(user.uid);
      setConversations(loadedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user?.uid]);

  // Load conversations on component mount and set up real-time listener
  useEffect(() => {
    if (user?.uid) {
      loadConversations();
      
      // Subscribe to real-time updates
      const unsubscribe = conversationManager.subscribeToConversations(
        user.uid,
        (updatedConversations) => {
          setConversations(updatedConversations);
          setIsLoadingConversations(false);
        }
      );

      // Cleanup function to unsubscribe when component unmounts or user changes
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        conversationManager.unsubscribeFromConversations(user.uid);
      };
    }
  }, [user?.uid, loadConversations]);

  const saveConversation = async (conversation) => {
    if (!user?.uid || !conversation) return;
    
    try {
      await conversationManager.saveConversation(user.uid, conversation);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const createNewConversation = () => {
    const newConversation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    
    setCurrentConversation(newConversation);
    setShowHistory(false);
    
    // Don't save empty conversation to DB yet - wait for first message
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isAILoading) return;

    setIsLoading(true);
    let conversation = currentConversation;
    
    // Create new conversation if none exists
    if (!conversation) {
      conversation = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: input.trim().substring(0, 50) + (input.trim().length > 50 ? '...' : ''), // Set title from first message
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentConversation(conversation);
    }

    const userMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    // Update conversation with user message immediately
    const conversationWithUserMessage = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      title: conversation.messages.length === 0 ? 
        input.trim().substring(0, 50) + (input.trim().length > 50 ? '...' : '') : 
        conversation.title
    };

    // Update UI immediately
    setCurrentConversation(conversationWithUserMessage);
    
    // Save to database immediately (like ChatGPT)
    await saveConversation(conversationWithUserMessage);

    const currentInput = input;
    setInput('');

    try {
      // Generate AI response
      const projectData = await generateProjectSetup(currentInput);
      
      const aiMessage = {
        id: `${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        content: projectData,
        timestamp: new Date().toISOString(),
      };

      // Update with AI response and potentially update title from project name
      const finalConversation = {
        ...conversationWithUserMessage,
        messages: [...conversationWithUserMessage.messages, aiMessage],
        title: conversationWithUserMessage.messages.length === 1 && projectData.project?.name ? 
          projectData.project.name : 
          conversationWithUserMessage.title
      };

      // Update UI immediately
      setCurrentConversation(finalConversation);
      
      // Save final conversation to database immediately
      await saveConversation(finalConversation);

    } catch (error) {
      console.error('Error generating project:', error);
      
      const errorMessage = {
        id: `${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        content: {
          type: 'error',
          message: error.message || 'An unexpected error occurred. Please try again.'
        },
        timestamp: new Date().toISOString(),
      };

      const errorConversation = {
        ...conversationWithUserMessage,
        messages: [...conversationWithUserMessage.messages, errorMessage],
      };

      // Update UI immediately
      setCurrentConversation(errorConversation);
      
      // Save error conversation to database immediately
      await saveConversation(errorConversation);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startEditingTitle = () => {
    setEditTitle(currentConversation?.title || 'New Conversation');
    setIsEditingTitle(true);
  };

  const saveTitle = async () => {
    if (currentConversation && editTitle.trim()) {
      const updatedConversation = {
        ...currentConversation,
        title: editTitle.trim(),
      };
      
      // Update UI immediately
      setCurrentConversation(updatedConversation);
      
      // Update title in database immediately
      try {
        await conversationManager.updateConversationTitle(currentConversation.id, editTitle.trim());
      } catch (error) {
        console.error('Error updating conversation title:', error);
      }
    }
    setIsEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
    setShowHistory(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    try {
      // Delete from database immediately
      await conversationManager.deleteConversation(conversationId);
      
      // Update UI immediately
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = (message) => {
    if (message.type === 'user') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-6 px-2 sm:px-4 w-full"
        >
          <div className="flex items-start space-x-3 sm:space-x-4 max-w-[85%] sm:max-w-[80%]">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-5 rounded-2xl rounded-tr-md shadow-lg overflow-hidden">
              <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start mb-6 px-2 sm:px-4 w-full"
        >
          <div className="flex items-start space-x-3 sm:space-x-4 max-w-[90%] sm:max-w-[85%]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CpuChipIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md shadow-xl overflow-hidden min-w-0 flex-1">
              {message.content.type === 'error' ? (
                <div className="p-4 sm:p-6">
                  <div className="text-red-600 text-sm break-words whitespace-pre-wrap">
                    <p className="font-semibold mb-2">Error:</p>
                    <p>{message.content.message}</p>
                  </div>
                </div>
              ) : (
                <EnhancedProjectCard project={message.content.project} />
              )}
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-purple-50 relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center sticky top-0 z-10"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {currentConversation ? (
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                      className="text-base sm:text-lg font-semibold bg-transparent border-b-2 border-purple-500 focus:outline-none flex-1 min-w-0"
                    />
                    <button
                      onClick={saveTitle}
                      className="p-1 text-green-600 hover:bg-green-50 rounded flex-shrink-0"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditTitle}
                      className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {currentConversation.title}
                    </h1>
                    <button
                      onClick={startEditingTitle}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all flex-shrink-0"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">AI Project Kickstarter</h1>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewConversation}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">New</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-md"
            >
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">History</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative mt-4 sm:mt-6">
          {currentConversation && currentConversation.messages.length > 0 ? (
            // Chat View
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto py-2 sm:py-4 space-y-4">
                {currentConversation.messages.map((message) => (
                  <div key={message.id}>
                    {renderMessage(message)}
                  </div>
                ))}
                {(isAILoading || isLoading) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-6 px-2 sm:px-4"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <CpuChipIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl rounded-tl-md shadow-xl">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-purple-500 rounded-full"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </div>
                          <span className="text-gray-600 font-medium">Gemini AI is crafting your project...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-3 sm:p-4 pb-0 mb-10 md:mb-0 md:pb-3">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe your project idea..."
                      className="w-full p-3 sm:p-4 pr-12 sm:pr-16 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white shadow-md text-sm sm:text-base min-h-[80px] max-h-[200px] overflow-y-auto"
                      rows={2}
                      disabled={isAILoading || isLoading}
                      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isAILoading || isLoading}
                      className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <RocketLaunchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Welcome screen
            <div className="h-full flex items-center justify-center p-4 sm:p-6 pb-4 mb-10 md:mb-0 md:pb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-6 sm:mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <SparklesIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                    AI Project Kickstarter
                  </h2>
                  <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
                    Powered by Google Gemini AI. Describe your project idea and get a complete setup generated for you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tell Gemini AI about your project idea..."
                      className="w-full p-4 sm:p-6 pr-12 sm:pr-16 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white shadow-md text-base sm:text-lg min-h-[120px] max-h-[200px] overflow-y-auto"
                      rows={3}
                      disabled={isAILoading || isLoading}
                      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isAILoading || isLoading}
                      className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Conversation History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingConversations ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-500 rounded-full mx-1"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-500">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations yet</p>
                    <button
                      onClick={createNewConversation}
                      className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Start your first conversation
                    </button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all group ${
                        currentConversation?.id === conversation.id
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {conversation.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(conversation.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.messages?.length || 0} messages
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteConversation(conversation.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createNewConversation}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="font-medium">New Conversation</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ...existing code...
const EnhancedProjectCard = ({ project }) => {
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    technologies: true,
    structure: false,
    setup: false
  });

  if (!project) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No project data received from Gemini AI</p>
      </div>
    );
  }

  const copyToClipboard = async (text, commandIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandIndex);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderFileStructure = (items) => {
    return (
      <div className="space-y-1">
        {items.map((item, index) => {
          const isFolder = item.endsWith('/');
          const depth = (item.match(/\//g) || []).length;
          const name = item.split('/').pop() || item;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center space-x-2 text-sm ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
              style={{ marginLeft: `${depth * 16}px` }}
            >
              {isFolder ? (
                <FolderIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <span className={`font-mono ${isFolder ? 'text-blue-700 font-medium' : 'text-gray-700'} break-words`}>
                {name || item}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 break-words flex items-center">
              <RocketLaunchIcon className="w-6 h-6 mr-3 flex-shrink-0" />
              {project.name || 'Untitled Project'}
            </h3>
            {project.description && (
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed break-words">
                {project.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Project Badges */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {project.difficulty && (
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center"
            >
              <SparklesIcon className="w-4 h-4 mr-1" />
              {project.difficulty}
            </motion.span>
          )}
          {project.estimatedTime && (
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center"
            >
              <ClockIcon className="w-4 h-4 mr-1" />
              {project.estimatedTime}
            </motion.span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Technologies Section */}
        {project.technologies && project.technologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <button
              onClick={() => toggleSection('technologies')}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <CodeIcon className="w-5 h-5 mr-2 text-purple-600" />
                Tech Stack
              </h4>
              <ExpandIcon className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform ${expandedSections.technologies ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSections.technologies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {project.technologies.map((tech, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 bg-white border border-purple-200 text-purple-800 rounded-lg text-sm font-medium text-center shadow-sm hover:shadow-md transition-all cursor-default"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Project Structure Section */}
        {project.structure && project.structure.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button
              onClick={() => toggleSection('structure')}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <FolderIcon className="w-5 h-5 mr-2 text-purple-600" />
                Project Structure
              </h4>
              <ExpandIcon className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform ${expandedSections.structure ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSections.structure && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                    <div className="max-h-64 overflow-y-auto">
                      {renderFileStructure(project.structure)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Setup Commands Section */}
        {project.scripts && project.scripts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <button
              onClick={() => toggleSection('setup')}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <DownloadIcon className="w-5 h-5 mr-2 text-purple-600" />
                Setup Commands
              </h4>
              <ExpandIcon className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform ${expandedSections.setup ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSections.setup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3">
                    {project.scripts.map((script, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="bg-gray-900 text-purple-400 p-4 rounded-xl font-mono text-sm overflow-x-auto border-l-4 border-purple-500">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <span className="text-green-400">$</span>
                              <span className="ml-2 whitespace-pre-wrap break-words">{script}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(script, index)}
                              className="ml-3 p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                              title="Copy command"
                            >
                              {copiedCommand === index ? (
                                <CheckIcon className="w-4 h-4 text-green-400" />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Step indicator */}
                        <div className="absolute -left-2 top-4 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-200 pt-6"
        >
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const allCommands = project.scripts?.join('\n') || '';
                copyToClipboard(allCommands, 'all');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-md"
            >
              <CopyIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Copy All Commands</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md"
            >
              <EyeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">View Details</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectKickstarter;