import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Col, Container, Row } from 'react-bootstrap'

const Footer = () => {
  return (
    <div className='footer'>
      <Container fluid={true}>
    <Row>
      <Col>
        <h3 className='info'>More information</h3>
        <p className='contact'>Phone:- +94770787187<br/>
          Email:- <a href={`mailto:${'info@sitesupplycraft.com'}`}>Efic@sit.com</a></p>
      </Col>

      <Col style={{textAlign:'right'}}>
       <div className="social-icons">
         <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
           <FontAwesomeIcon icon={faFacebook} />
         </a>
         <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
           <FontAwesomeIcon icon={faTwitter} />
         </a>
         <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
           <FontAwesomeIcon icon={faInstagram} />
         </a>
         <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer">
           <FontAwesomeIcon icon={faWhatsapp} />
         </a>
        </div>
      </Col>
    </Row>
        <Col>
          <center>
            Copy Right &copy; Smart learn 360 EFIC{new Date().getFullYear()}
            </center>
       </Col>
      </Container>
   </div>
  )
}

export default Footer