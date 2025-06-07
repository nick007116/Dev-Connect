import React, { useState, useEffect } from 'react';
import { DIAGRAM_TYPES } from '../constants/diagramTemplates';
import { motion } from 'framer-motion';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { Code, Plus } from 'lucide-react';

const NewProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('flowchart');

  return (
    <motion.div 
      className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-8 w-11/12 max-w-md">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Create New Project</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project Title"
          className="w-full p-3 border border-indigo-100 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 border border-indigo-100 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {DIAGRAM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate({ title, type })}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const q = query(collection(db, 'diagrams'), where('allowedUsers', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        const userProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(userProjects);
        setTimeout(() => setLoadingDiagrams(false), 300);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateProject = async (project) => {
    try {
      const docRef = await addDoc(collection(db, 'diagrams'), {
        userId: user.uid,
        title: project.title,
        type: project.type,
        date: serverTimestamp(),
        updatedAt: serverTimestamp(),
        allowedUsers: [user.uid]
      });
      const newProject = { 
        id: docRef.id, 
        ...project,
        updatedAt: new Date(),
      };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setShowModal(false);
      navigate(`/editor/${docRef.id}?title=${project.title}&type=${project.type}`);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, 'diagrams', projectId));
      setProjects((prevProjects) => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 pb-24 md:pb-0">
      {/* Mobile Header - Matching Chat Page Style */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-indigo-100">
          <div className="flex items-center justify-between p-4 pt-8 pl-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Diagrams
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'pt-24 pb-24' : 'py-16'}`}>
        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Diagrams
              </h1>
            </div>
          </div>
        )}

        {/* FAB for Mobile */}
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="fixed bottom-28 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"
          >
            <Plus className="w-7 h-7 text-white" />
          </motion.button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {!isMobile && <ProjectCard isNew onClick={() => setShowModal(true)} />}
          
          {loadingDiagrams ? (
            <div className="col-span-full">
              <Loader />
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="bg-indigo-50 rounded-full p-6 mb-6">
                <Code className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No diagrams yet</h3>
              <p className="text-gray-500 text-center max-w-sm mb-8">
                Create your first diagram to visualize your ideas and collaborate with your team.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
              >
                Create your first diagram
              </button>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                {...project}
                snapshot={project.snapshot}
                onClick={() => navigate(`/editor/${project.id}?title=${project.title}&type=${project.type}`)}
                onDelete={() => handleDeleteProject(project.id)}
                teamMembers={project.allowedUsers}
              />
            ))
          )}
        </div>
      </div>

      <NewProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default Home;