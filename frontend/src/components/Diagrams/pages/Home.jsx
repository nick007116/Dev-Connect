import React, { useState, useEffect } from 'react';
import { DIAGRAM_TYPES } from '../constants/diagramTemplates';
import { motion } from 'framer-motion';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader'; // Import a custom loader component

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project Title"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        >
          {DIAGRAM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate({ title, type })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true); // Add loading state for diagrams
  const { user } = useAuth(); // Assuming you have a custom hook to get the current user
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const q = query(collection(db, 'diagrams'), where('allowedUsers', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        const userProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(userProjects);
        setTimeout(() => setLoadingDiagrams(false), 100); // Simulate loading delay for diagrams
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
        allowedUsers: [user.uid]
      });
      const newProject = { id: docRef.id, ...project };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setShowModal(false);
      // Redirect to the MermaidDiagram page with the new project's details
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
  <h1 className="text-5xl leading-relaxed font-bold mb-8 inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-colors duration-300 py-2">
    Your Diagrams
  </h1>
  <p className="text-lg text-gray-600">Create and collaborate on beautiful diagrams</p>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProjectCard isNew onClick={() => setShowModal(true)} />
          {loadingDiagrams ? (
            <Loader /> // Show the loader in the middle with a blurred background
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                {...project}
                snapshot={project.snapshot} // Assuming snapshot URL is stored in the project data
                onClick={() => navigate(`/editor/${project.id}?title=${project.title}&type=${project.type}`)}
                onDelete={() => handleDeleteProject(project.id)}
                teamMembers={project.allowedUsers} // Pass the team members
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