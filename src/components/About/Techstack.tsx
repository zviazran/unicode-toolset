import React from "react";
import { Col, Row } from "react-bootstrap";
import StarRatings from "react-star-ratings";


interface TechstackProps {
  name: string;
  initialRating: number;
}

const Techstack: React.FC<TechstackProps> = ({ name, initialRating }) => {
  return (
    <Row style={{ justifyContent: "left", paddingBottom: "10px" }}>
      <Col className="skill-name" xs={4}>
        {name}
      </Col>
      <Col xs={6}>
        <StarRatings
          rating={initialRating}
          starRatedColor="gold"
          numberOfStars={5}
          starDimension="20px"
          starSpacing="2px"
          name="rating"
        />
      </Col>
    </Row>
  );
};

export default Techstack;
