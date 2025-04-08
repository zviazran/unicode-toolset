import React from "react";
import { Col, Row } from "react-bootstrap";
import StarRatings from "react-star-ratings";


interface TechstackProps {
  name: string;
  initialRating: number;
}

const Techstack: React.FC<TechstackProps> = ({ name, initialRating }) => {
  return (
    <Row className="align-items-center" style={{ paddingBottom: "10px" }}>
      <Col xs={12} sm={4} className="skill-name">
        {name}
      </Col>
      <Col xs={12} sm={6}>
        <StarRatings
          rating={initialRating}
          starRatedColor="gold"
          numberOfStars={5}
          starDimension="14px"
          starSpacing="1px"
          name="rating"
        />
      </Col>
    </Row>
  );
};

export default Techstack;
