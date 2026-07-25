import { useEffect, useRef } from "react";
import Typed from "typed.js";
import "./Hero.css";

function Hero() {

    const typedRef = useRef(null);

    useEffect(() => {

        const typed = new Typed(typedRef.current, {

            strings: [
                "MERN Stack Developer",
                "Java Programmer",
                "AI & ML Enthusiast",
                "Problem Solver"
            ],

            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 1500,
            loop: true
        });

        return () => typed.destroy();

    }, []);

    return (

        <section id="home" className="hero">

            <div className="container">

                <div className="row align-items-center min-vh-100">

                    <div className="col-lg-6">

                        <p className="text-info fw-semibold">
                            Hello, I'm
                        </p>

                        <h1 className="display-3 fw-bold">
                            Monish Pandian D
                        </h1>

                        <h3 className="mb-4">
                            <span ref={typedRef}></span>
                        </h3>

                        <p className="lead text-secondary">
                            Passionate Information Technology student focused on
                            building scalable web applications, solving DSA
                            problems, and exploring Artificial Intelligence.
                        </p>

                        <div className="mt-4">

                            <a
                                href="#projects"
                                className="btn btn-info me-3 px-4 py-2"
                            >
                                View Projects
                            </a>

                            <a
                                href="/resume.pdf"
                                className="btn btn-outline-light px-4 py-2"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Resume
                            </a>

                        </div>

                        <div className="mt-5 social-icons">

                            <a href="https://github.com/Monish-Pandian">
                                <i className="bi bi-github"></i>
                            </a>

                            <a href="https://www.linkedin.com/in/monish-pandian-234a93333">
                                <i className="bi bi-linkedin"></i>
                            </a>

                            <a href="mailto:monnishpandian.25@gmail.com">
                                <i className="bi bi-envelope-fill"></i>
                            </a>

                        </div>

                    </div>

                    <div className="col-lg-6 text-center">

                        <img
                            src="/images/profile.jpeg"
                            className="img-fluid hero-image"
                            alt="Profile"
                        />

                    </div>

                </div>

            </div>

        </section>

    );
}

export default Hero;