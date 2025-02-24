import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";

interface ToolsetCardsProps {
  imgPath: string;
  title: string;
  joke: string;
  description: string;
  link: string; // an internal route like "/toolsets/1"
}

const ToolsetCards: React.FC<ToolsetCardsProps> = ({
  imgPath,
  title,
  joke,
  description,
  link,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`../${link}`);
  };

  return (
    <Card
      className="toolset-card-view"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
    >
      <Card.Img variant="top" src={imgPath} alt="card-img" />
      <Card.Body>
        <Card.Title style={{ fontWeight: "bold" }}>{title}</Card.Title>
        <Card.Text style={{ fontWeight: "bold" }}>{joke}</Card.Text>
        <Card.Text style={{ textAlign: "justify" }}>{description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ToolsetCards;
