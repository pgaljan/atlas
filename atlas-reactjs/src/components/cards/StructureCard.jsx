import React from "react";
import Card from "../../components/cards/Card";

const StructureCard = () => {
  const handleClick = (e) => {
    if (onActionClick) {
      e.preventDefault();
      onActionClick();
    }
  };
  
  return (
    <div className="p-3">
      <div className="flex flex-col items-start gap-2">
        <h2 className="text-[24px] font-bold text-black">Dashboard</h2>
        <h3 className="text-[17px] font-semibold text-gray-600 mb-4">
          Recently opened markmaps
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Example cards */}
        <Card
          title="Sample Card 1"
          imageUrl="/assets/markmap-image.png"
          footerTitle="Modified 20 hours ago"
          footerSubtitle="Test User"
          avatarUrl="/assets/userimg.jpeg"
          onActionClick={handleClick}
        />
        <Card
          title="Sample Card 2"
          imageUrl="/assets/markmap-image.png"
          footerTitle="Modified 1 day ago"
          footerSubtitle="Jane Doe"
          avatarUrl="/assets/userimg.jpeg"
          onActionClick={handleClick}
        />
        <Card
          title="Sample Card 3"
          imageUrl="/assets/markmap-image.png"
          footerTitle="Modified 2 days ago"
          footerSubtitle="John Smith"
          avatarUrl="/assets/userimg.jpeg"
          onActionClick={handleClick}
        />
        <Card
          title="Sample Card 4"
          imageUrl="/assets/markmap-image.png"
          footerTitle="Modified 2 days ago"
          footerSubtitle="John Smith"
          avatarUrl="/assets/userimg.jpeg"
          onActionClick={handleClick}
        />
      </div>
    </div>
  );
};

export default StructureCard;
