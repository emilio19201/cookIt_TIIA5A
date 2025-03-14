import meter1 from "../assets/img/meter1.png";
import meter2 from "../assets/img/meter2.png";
import meter3 from "../assets/img/meter3.png";
import meter4 from "../assets/img/meter4.png"
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import colorSharp from "../assets/img/color-sharp.png"

export const Comments = () => {
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  return (
    <section className="skill" id="skills">
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="skill-bx wow zoomIn">
                        <h2>Comentarios</h2>
                        <p></p>
                        <Carousel responsive={responsive} infinite={true} className="owl-carousel owl-theme skill-slider">
                            <div className="item">
                                <img src={meter1} alt="pfp1" />
                                <h5>Diseño de página</h5>
                                <h6>Calificación: 5</h6>
                            </div>
                            <div className="item">
                                <img src={meter2} alt="pfp2" />
                                <h5>Fácil navegación</h5>
                                <h6>Calificación: 4</h6>
                            </div>
                            <div className="item">
                                <img src={meter3} alt="pfp3" />
                                <h5>Colorimetría</h5>
                                <h6>Calificación: 4</h6>
                            </div>
                            <div className="item">
                                <img src={meter4} alt="pfp4" />
                                <h5>Recetas</h5>
                                <h6>Calificación: 5</h6>
                            </div>
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
        <img className="background-image-left" src={colorSharp} alt="bgimg" />
    </section>
  )
}
