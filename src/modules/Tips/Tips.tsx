import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import MediumFeed from "../../components/MediumFeed";
import "../../App.css";

const Tips: React.FC = () => {
  return (
    <div className="about-resume">
      <section>
        <Container fluid className="about-section">
          <Container className="about-content">
            <Row>
              <Col md={8} className="about-header">
                <h1 className="heading">Tips</h1>
                <p className="heading-description">
                  Some Unicode tips everyone should know. 
                </p>

                <div style={{ marginTop: 20 }}>
                  <MediumFeed username="zviazran" maxArticles={10} />
                </div>
              </Col>
            </Row>
          </Container>
        </Container>
      </section>
    </div>
  );
};

export default Tips;
