import React from "react";
import myImg from "../../Assets/zvi_azran_img.jpg";
import SocialMedia from "../../components/SocialMedia";
import { Container, Row, Col } from "react-bootstrap";
import "../../App.css";

const About: React.FC = () => {
  return (
    <div className="about-resume">
      <section>
        <Container fluid className="about-section">
          <Container className="about-content">
            <Row>
              <Col md={6} className="about-header">
                <h1 className="heading">
                  Hello There!{" "}
                  <span className="wave" role="img" aria-labelledby="wave">
                    👋🏻
                  </span>
                </h1>

                <h2 className="heading-name">
                  I'm
                  <strong className="main-name"> Zvi Azran</strong> (צבי עזרן)
                </h2>

                <p className="heading-description blockquote">
                  I'm a Computer Science & Math teacher and an unapologetic Unicode enthusiast. I'm a former software engineer with a decade of experience developing for cybersecurity solutions, optimizing performance, and maintaining complex codebases.<br/><br/>This project is both a useful toolset for anyone to use or teach with, and a love letter to the plain old text that everyone unfairly takes for granted.<br/><br/>My goal is to make this project worthy of your browser favorites 🤗 It's free and publicly available for all. 
                </p>
              </Col>

              <Col md={5}>
                <img src={myImg} className="profile-pic" alt="avatar" />
              </Col>
            </Row>
          </Container>
        </Container>

        <Container>
          <Row>
            <Col md={12} className="about-social">
              <h1>Get in Touch</h1>
              <p style={{ fontSize: 20 }} >
                Any suggestions or bugs? please email me at <a href="mailto:zviazran@gmail.com">zviazran@gmail.com</a>      
                <br/>
                Also feel free to connect for anything regarding Unicode
              </p>
              <SocialMedia />
            </Col>
          </Row>
          
        </Container>
      </section>
    </div>
  );
};

export default About;
