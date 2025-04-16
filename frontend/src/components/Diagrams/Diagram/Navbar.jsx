import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import {
  db,
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  where,
} from "../../../lib/firebase"; // Adjust path as needed

const Navbar = ({ title, svgOutput, projectId, currentUser, diagramType }) => {
  const navigate = useNavigate();
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [userList, setUserList] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [allowedUserDetails, setAllowedUserDetails] = useState([]);
  const [showContributors, setShowContributors] = useState(false);
  const dropdownRef = useRef(null);
  const downloadRef = useRef(null);

  useEffect(() => {
    const fetchAllowedUsers = async () => {
      const projectRef = doc(db, "diagrams", projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const allowedArr = projectSnap.data().allowedUsers || [];
        setAllowedUsers(allowedArr);

        // Fetch user details for allowed users
        const userDocs = await Promise.all(
          allowedArr.map((userId) => getDoc(doc(db, "users", userId)))
        );
        const userDetails = userDocs.map((uDoc) => ({
          id: uDoc.id,
          ...uDoc.data(),
        }));
        setAllowedUserDetails(userDetails);
      }
    };
    fetchAllowedUsers();
  }, [projectId]);

  const currentUserDetail =
    allowedUserDetails.find((u) => u.id === currentUser?.uid) || {};

  const handleDownload = async (format) => {
    try {
      if (format === "svg") {
        const blob = new Blob([svgOutput], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title || "diagram"}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgOutput, "image/svg+xml");
      const svg = svgDoc.querySelector("svg");
      if (!svg) return;

      const width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
      const height = svg.viewBox.baseVal.height || svg.height.baseVal.value;

      const svgElement = document.createElement("div");
      svgElement.innerHTML = svg.outerHTML;
      document.body.appendChild(svgElement);

      const dataUrl = await htmlToImage.toPng(svgElement, {
        width: width * 2,
        height: height * 2,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
        },
      });

      document.body.removeChild(svgElement);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title || "diagram"}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading diagram:", error);
    }
  };

  const fetchUserList = async () => {
    if (!currentUser?.uid) {
      console.error("Current user is not defined");
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    const foundUsers = [];
    querySnapshot.forEach((docSnap) => {
      const chatData = docSnap.data();
      const otherUserId = chatData.participants.find(
        (id) => id !== currentUser.uid
      );
      if (otherUserId) {
        foundUsers.push(otherUserId);
      }
    });

    const uniqueUsers = [...new Set(foundUsers)];
    const userDocs = await Promise.all(
      uniqueUsers.map((id) => getDoc(doc(db, "users", id)))
    );
    const userListData = userDocs.map((uDoc) => ({
      id: uDoc.id,
      ...uDoc.data(),
    }));

    // Filter out users already in allowedUsers
    const filteredUserList = userListData.filter(
      (user) => !allowedUsers.includes(user.id)
    );
    setUserList(filteredUserList);
  };

  const handleAddUser = async (userId) => {
    const projectRef = doc(db, "diagrams", projectId);
    const updatedAllowedUsers = [
      ...new Set([...allowedUsers, userId, currentUser.uid]),
    ];
    await updateDoc(projectRef, { allowedUsers: updatedAllowedUsers });
    setAllowedUsers(updatedAllowedUsers);

    // Fetch & update user details for the newly added user
    const userDoc = await getDoc(doc(db, "users", userId));
    const newUser = { id: userDoc.id, ...userDoc.data() };
    setAllowedUserDetails([...allowedUserDetails, newUser]);

    setShowUserList(false);
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowContributors(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Close the download options if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [downloadRef]);

  const toggleContributors = () => {
    setShowContributors((prev) => !prev);
  };

  const toggleDownloadOptions = () => {
    setShowDownloadOptions((prev) => !prev);
  };

  return (
    <>
      {/* Prevent content from going under navbar */}
      <div className="h-16" />

      <nav className="fixed top-0 inset-x-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
        <div className="relative mx-auto px-6 max-w-7xl w-full">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/diagrams")} // Navigate to the diagram home page
                className="aspect-square p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="aspect-square p-2.5 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-400">
                    {`${diagramType} Diagram` || "Diagram"}
                  </span>
                  <h1 className="text-sm font-semibold text-gray-900">
                    {title || "Untitled Diagram"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <div ref={downloadRef} className="relative">
                <button
                  onClick={toggleDownloadOptions}
                  className="aspect-square p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                  title="Export diagram"
                >
                  <Download className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
                </button>

                {/* Download Options */}
                {showDownloadOptions && (
                  <div className="absolute top-12 right-0 w-48 p-1.5 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in z-50">
                    {["PNG", "JPG", "SVG"].map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          handleDownload(format.toLowerCase());
                          setShowDownloadOptions(false);
                        }}
                        className="w-full p-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download as {format}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-gray-200" />

              {/* Current user display + arrow */}
              <div
                onClick={toggleContributors}
                className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer relative"
                title="Show contributors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-white overflow-hidden">
                  {currentUserDetail.photoURL ? (
                    <img
                      src={currentUserDetail.photoURL}
                      alt={currentUserDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {currentUserDetail.name?.[0] || "?"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUserDetail.name
                    ? `${currentUserDetail.name} (You)`
                    : "(You)"}
                </span>
                {showContributors ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}

                {/* Contributors Dropdown */}
                {showContributors && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-12 right-0 w-48 p-1.5 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in z-50"
                  >
                    {allowedUserDetails
                      .filter((u) => u.id !== currentUser?.uid)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-white overflow-hidden">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm font-medium">
                                {user.name ? user.name[0] : "?"}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {user.name}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Button to add collaborators */}
              <button
                onClick={() => {
                  setShowUserList((prev) => !prev);
                  fetchUserList();
                }}
                className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center ring-2 ring-white hover:bg-blue-100 transition-colors"
                title="Add collaborator"
              >
                <Plus className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Add User Dropdown */}
        {showUserList && (
          <div className="absolute top-[68px] right-6 w-48 p-1.5 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
            {userList.length > 0 ? (
              userList.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleAddUser(user.id)}
                  className="w-full p-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {user.name[0]}
                      </span>
                    )}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                No users available to add
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;