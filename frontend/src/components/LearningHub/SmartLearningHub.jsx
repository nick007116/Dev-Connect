import React, { useState } from 'react';
import { BookOpen, Trophy, Target, Users, Star, Play, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SmartLearningHub = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProgress, setUserProgress] = useState({
    level: 12,
    xp: 2840,
    nextLevelXp: 3000,
    streak: 7,
    completedChallenges: 45,
    totalSkills: 8
  });

  const learningPaths = [
    {
      id: 'react-mastery',
      title: 'React Mastery',
      description: 'Master React from basics to advanced patterns',
      progress: 85,
      difficulty: 'Intermediate',
      duration: '6 weeks',
      skills: ['React', 'Hooks', 'Context', 'Performance'],
      enrolled: 12500,
      rating: 4.8
    },
    {
      id: 'fullstack-js',
      title: 'Full-Stack JavaScript',
      description: 'Complete JavaScript development from frontend to backend',
      progress: 23,
      difficulty: 'Advanced',
      duration: '12 weeks',
      skills: ['Node.js', 'Express', 'MongoDB', 'React'],
      enrolled: 8900,
      rating: 4.9
    },
    {
      id: 'python-ml',
      title: 'Python for Machine Learning',
      description: 'Build ML models with Python and TensorFlow',
      progress: 0,
      difficulty: 'Beginner',
      duration: '8 weeks',
      skills: ['Python', 'TensorFlow', 'Pandas', 'NumPy'],
      enrolled: 15200,
      rating: 4.7
    }
  ];

  const dailyChallenges = [
    {
      id: 1,
      title: 'Implement Custom React Hook',
      difficulty: 'Medium',
      xp: 150,
      timeLimit: '45 min',
      completed: false,
      description: 'Create a custom hook for API data fetching with error handling'
    },
    {
      id: 2,
      title: 'Optimize SQL Query',
      difficulty: 'Hard',
      xp: 200,
      timeLimit: '30 min',
      completed: true,
      description: 'Optimize a slow database query using indexing and joins'
    },
    {
      id: 3,
      title: 'Debug React Performance Issue',
      difficulty: 'Easy',
      xp: 100,
      timeLimit: '20 min',
      completed: false,
      description: 'Find and fix unnecessary re-renders in a React component'
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior React Developer at Meta',
      expertise: ['React', 'Performance', 'Architecture'],
      rating: 4.9,
      sessions: 250,
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=4f46e5&color=fff',
      available: true
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'Full-Stack Engineer at Google',
      expertise: ['Node.js', 'System Design', 'APIs'],
      rating: 4.8,
      sessions: 180,
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=059669&color=fff',
      available: false
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{userProgress.level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{width: `${(userProgress.xp / userProgress.nextLevelXp) * 100}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{userProgress.xp}/{userProgress.nextLevelXp} XP</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{userProgress.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{userProgress.completedChallenges}</div>
              <div className="text-sm text-gray-600">Challenges</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{userProgress.totalSkills}</div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Challenges</h3>
        <div className="space-y-4">
          {dailyChallenges.map((challenge) => (
            <div key={challenge.id} className={`p-4 rounded-lg border ${challenge.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{challenge.title}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">{challenge.xp} XP</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{challenge.timeLimit}</span>
                </div>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    challenge.completed 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={challenge.completed}
                >
                  {challenge.completed ? 'Completed' : 'Start Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLearningPaths = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {learningPaths.map((path) => (
        <motion.div
          key={path.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{path.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{path.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{path.difficulty}</span>
                <span>•</span>
                <span>{path.duration}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{path.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{path.progress}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{width: `${path.progress}%`}}
            ></div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {path.skills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {path.enrolled.toLocaleString()} enrolled
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              {path.progress > 0 ? 'Continue' : 'Start Learning'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderMentorship = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect with Industry Mentors</h2>
        <p className="text-gray-600">Get personalized guidance from experienced professionals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={mentor.avatar} 
                alt={mentor.name} 
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{mentor.name}</h3>
                <p className="text-sm text-gray-600">{mentor.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{mentor.rating}</span>
                  <span className="text-sm text-gray-500">• {mentor.sessions} sessions</span>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${mentor.available ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>

            <button 
              className={`w-full px-4 py-2 rounded-lg font-medium ${
                mentor.available 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!mentor.available}
            >
              {mentor.available ? 'Book Session' : 'Currently Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto h-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Learning Hub
              </h1>
              <p className="text-gray-600">AI-powered personalized learning with mentorship and challenges</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Target },
              { id: 'paths', name: 'Learning Paths', icon: BookOpen },
              { id: 'mentorship', name: 'Mentorship', icon: Users }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'paths' && renderLearningPaths()}
          {activeTab === 'mentorship' && renderMentorship()}
        </div>
      </div>
    </div>
  );
};

export default SmartLearningHub;