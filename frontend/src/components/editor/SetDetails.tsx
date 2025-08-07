import React from 'react';

interface SetDetailsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  tags: string;
  setTags: (tags: string) => void;
}

const SetDetails: React.FC<SetDetailsProps> = ({ name, setName, description, setDescription, tags, setTags }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Set Name"
        className="w-full text-2xl font-bold border-b-2 focus:outline-none focus:border-indigo-500"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full p-2 border rounded resize-none"
        rows={2}
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default SetDetails;