import React, { useState } from 'react';
// Import the data from the new JS bridge file
import { familyTree } from './familyTree'; 

/**
 * Helper component to display a person's image and name.
 */
const PersonCardContent = ({ person }) => {
    // Check for both 'image' (lowercase) and 'Image' (capitalized) to handle data inconsistencies.
    const imageFileName = person.image || person.Image; 
    
    // The image URL is constructed assuming all images are directly in the public folder.
    const imageUrl = `/${imageFileName}`;
    const fallbackImage = 'https://via.placeholder.com/150x150?text=Profile';
    
    return (
        <>
            <img
                src={imageUrl}
                // Fallback in case the image file name is incorrect or the file is missing
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                alt={`Image of ${person.name}`}
                className="w-28 h-28 rounded-full object-cover mb-2 border-4 border-indigo-100"
            />
            <p className="text-center font-bold text-lg text-gray-800">
                {person.name}
            </p>
        </>
    );
};

/**
 * Renders a single person and handles the expandable/collapsible logic.
 */
const MemberNode = ({ person }) => {
    
    // Determine if this is the root node
    const isRoot = person.name === familyTree.name && !!person.spouses;
    
    // Check for the presence of the singular 'spouse' object on non-root nodes
    const hasSpouse = person.spouse && typeof person.spouse === 'object';
    
    // Check for children
    const hasChildren = person.children && person.children.length > 0;
    
    // CRITICAL FIX: A node is interactive if it's the root, OR has children, OR has a spouse.
    // This ensures married people without children (like Manu Aryal) can be expanded to show their spouse.
    const hasFamily = isRoot || hasChildren || hasSpouse;
    
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        if (hasFamily) {
            setIsExpanded(!isExpanded);
        }
    };

    // IDs for accessibility
    const familyId = `family-${person.name.replace(/\s/g, '-')}`;
    
    // Common Tailwind classes for the card base
    const cardBaseClasses = `flex flex-col items-center p-4 m-3 w-44 rounded-lg shadow-xl 
                            bg-white transition-all duration-300 transform 
                            focus:outline-none focus:ring-4 focus:ring-indigo-300`;

    // --- Start Rendering the Member Card ---

    // 1. If it has family (spouse OR children OR is root), render an interactive button.
    if (hasFamily) {
        return (
            <div className="flex flex-col items-center">
                <button
                    onClick={handleToggle}
                    className={`
                        ${cardBaseClasses} 
                        cursor-pointer hover:bg-indigo-50 hover:shadow-2xl
                    `}
                    // ARIA attributes for accessibility
                    aria-expanded={isExpanded}
                    aria-controls={familyId}
                    aria-label={`${person.name}, ${isExpanded ? 'Collapse family' : 'Expand family'}`}
                >
                    <PersonCardContent person={person} />
                    <span 
                        className={`mt-2 text-sm font-semibold transition-transform duration-300 
                                    ${isExpanded ? 'text-red-500' : 'text-indigo-500'}`}
                        aria-hidden="true" // Decorative indicator
                    >
                        {isExpanded ? '− Hide Details' : '+ View Details'}
                    </span>
                </button>
                
                {/* --- Collapsible Content --- */}
                <div 
                    id={familyId}
                    className={`w-full transition-all duration-500 overflow-hidden 
                            ${isExpanded ? 'max-h-fit mt-4' : 'max-h-0'}`}
                    aria-hidden={!isExpanded}
                >
                    {isExpanded && (
                        <div className="p-4 border-l-4 border-indigo-400 bg-indigo-50 ml-4 rounded-b-lg">
                            
                            {/* ------------------------------------- */}
                            {/* --- Logic for the ROOT's Spouses --- */}
                            {/* ------------------------------------- */}
                            {isRoot && person.spouses && (
                                <>
                                    <h3 className="text-lg font-bold text-indigo-700 mb-4 border-b-2 border-indigo-300 pb-1">
                                        Spouses
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {/* Root Spouses: They are clickable because they lead to children */}
                                        {person.spouses.map((spouse) => (
                                            <MemberNode key={spouse.name} person={spouse} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 italic mt-4 text-center">
                                        Click on each spouse to see their respective children.
                                    </p>
                                </>
                            )}


                            {/* ------------------------------------------- */}
                            {/* --- Logic for NON-ROOT nodes (Children) --- */}
                            {/* ------------------------------------------- */}
                            {!isRoot && (
                                <>
                                    {/* Section 1: Single Spouse (Using 'person.spouse' key) */}
                                    {hasSpouse && (
                                        <>
                                            <h3 className="text-lg font-bold text-indigo-700 mb-4 border-b-2 border-indigo-300 pb-1">
                                                Spouse
                                            </h3>
                                            <div className="flex flex-wrap justify-center gap-4 mb-6">
                                                {/* Spouse is rendered as a standard MemberNode, but since they lack
                                                    children in the data, the MemberNode logic will treat them as a static card (leaf).
                                                */}
                                                <MemberNode person={person.spouse} />
                                            </div>
                                        </>
                                    )}

                                    {/* Section 2: Children (Using 'person.children' array) */}
                                    {hasChildren && (
                                        <>
                                            <h3 className="text-lg font-bold text-indigo-700 mb-4 border-b-2 border-indigo-300 pb-1">
                                                Children ({person.children.length})
                                            </h3>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {person.children.map((child) => (
                                                    <MemberNode key={child.name} person={child} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    } else {
        // 2. If it is a true leaf node (no spouse, no children, not root), render a static DIV (no button).
        return (
            <div className={`${cardBaseClasses} border-2 border-gray-300 cursor-default`}>
                <PersonCardContent person={person} />
            </div>
        );
    }
};

// --- Main Application Component ---
function App() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10">
                    Interactive Family Tree
                </h1>
                
                {/* Start the recursive tree with the root person */}
                <div className="flex justify-center">
                    <MemberNode person={familyTree} />
                </div>
            </div>
        </div>
    );
}

export default App;