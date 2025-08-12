import React, { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";
import { fetchCollections } from "../../api";

interface CollectionSelectorProps {
  onSelectCollection: (collection: string | null) => void;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({ onSelectCollection }) => {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

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

  const handleChange = (
    event: React.SyntheticEvent,
    value: string | null,
  ) => {
    setSelectedCollection(value);
    onSelectCollection(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Select Topic</Typography>
      <Autocomplete
        freeSolo
        options={["", ...collections]} // Include empty string for "None"
        value={selectedCollection || ""}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Topic"
            variant="outlined"
            size="small"
            placeholder="Select or type a custom topic..."
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option || "none"}>
            {option === "" ? <em>None</em> : option}
          </li>
        )}
        fullWidth
        sx={{ maxWidth: "100%" }}
      />
    </Box>
  );
};

export default CollectionSelector;