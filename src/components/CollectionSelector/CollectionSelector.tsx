import React, { useState, useEffect } from "react";
import { fetchCollections } from "../../api";
import "./CollectionSelector.css";

interface CollectionSelectorProps {
  onSelectCollection: (collection: string | null) => void;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  onSelectCollection,
}) => {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [customCollection, setCustomCollection] = useState(""); // State for text input

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };
    loadCollections();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : e.target.value;
    setSelectedCollection(value);
    setCustomCollection(""); // Clear text input when selecting from dropdown
    onSelectCollection(value);
  };

  const handleCustomCollectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCollection(value);
    setSelectedCollection(value || null); // Set to null if empty
    onSelectCollection(value || null); // Pass to parent
  };

  return (
    <div className="collection-selector">
      <h3>Select Collection</h3>
      <input
        type="text"
        value={customCollection}
        onChange={handleCustomCollectionChange}
        className="collection-input"
      />
      <select value={selectedCollection || ""} onChange={handleSelect}>
        <option value="">None</option>
        {collections.map((collection) => (
          <option key={collection} value={collection}>
            {collection}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CollectionSelector;