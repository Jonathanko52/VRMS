import React, { useState, useEffect } from 'react';
import moment from 'moment';

import '../sass/CheckIn.scss';

const CheckInForm = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    // const [isFormReady, setIsFormReady] = useState(true);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [questions, setQuestions] = useState([]);
    const [newOrReturning] = useState(props && props.match.params.userType);
    const [formInput, setFormInput] = useState({ 
        email: "",
        currentRole: "",
        desiredRole: "",
        attendanceLength: ""
    });
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [newMember, setNewMember] = useState(true);
    const [month, setMonth] = useState(moment().format('MMM').toUpperCase());
    const [year, setYear] = useState(moment().format("YYYY"));
    const [reason, setReason] = useState("--SELECT ONE--");
    const [project, setProject] = useState("--SELECT ONE--");
    const [user, setUser] = useState(null);

    // form data to fill drop-downs
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const years = ["2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013"];
    const reasons = ["--SELECT ONE--", "Open Data", "Homelessness", "Social Justice/Equity", "Transportation", "Mental Health", "Civic Engagement", "Environment", "Education/STEM", "Fundraising"];
    const projects = ["--SELECT ONE--", "311 Data", "ArtWatcher", "Civic Tech Index", "Engage", "Food Oasis", "Gender Equity", "HackforLA.org Website", "Heart", "HelloGOV", "Host Home", "Jobs for Hope", "LA Crime Sentencing", "Lucky Parking", "Metro On-time", "New Schools Today", "Not Today", "Public Tree Map", "Record Clearance", "Shared Housing Project", "Spare", "TDM Calculator", "Undebate", "VRMS", "None"];

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/questions");
            const resJson = await res.json();

            setQuestions(resJson);
            setIsLoading(false);
        } catch(error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => setFormInput({
        ...formInput,
        [e.currentTarget.name]: e.currentTarget.value
    });

    const handleFirstNameChange = (e) => setFirstName(
        e.currentTarget.value
    );

    const handleLastNameChange = (e) => setLastName(
        e.currentTarget.value
    );

    const handleMonthChange = (e) => setMonth(
        e.currentTarget.value
    );

    const handleYearChange = (e) => setYear(
        e.currentTarget.value
    );

    const handleReasonChange = (e) => {
        setReason(e.currentTarget.value);
        setIsQuestionAnswered(true);
    };

    const handleProjectChange = (e) => {
        setProject(e.currentTarget.value);
        setIsQuestionAnswered(true);
    };
    
    const handleNewMemberChange = (e) => {
        if (e.target.value === "true") {
            setNewMember(true);
            setMonth(moment().format('MMM').toUpperCase());
            setYear(moment().format('YYYY'));
        }

        if (e.target.value === "false") {
            setNewMember(false);
        }
    };
    
    const submitForm = (userForm) => {
        // First, create a new user in the user collection
        const headerToSend = process.env.REACT_APP_CUSTOM_REQUEST_HEADER;

        fetch('/api/users', {
            method: "POST",
            body: JSON.stringify(userForm),
            headers: {
                "Content-Type": "application/json",
                "x-customrequired-header": headerToSend
            }
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }

                throw new Error(res.statusText);
            })
            .then(responseId => {
                // Then, create a new check-in

                const checkInForm = { userId: (responseId), eventId: new URLSearchParams(props.location.search).get('eventId') };

                return fetch('/api/checkins', {
                    method: "POST",
                    body: JSON.stringify(checkInForm),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(res => {
                    props.history.push('/magicLink');
                })
                .catch(err => console.log(err));
            })
            .catch(err => {
                console.log(err);
            });
    }

    const submitReturning = (e) => {
        e.preventDefault();

        const answer = {};

        if (reason !== "--SELECT ONE--") {
            answer.attendanceReason = reason;
        }

        if (project !== "--SELECT ONE--") {
            answer.currentProject = project;
        }

        if ((user.attendanceReason === undefined && reason === "--SELECT ONE--") || (user.currentProject === undefined && project === "--SELECT ONE--")) {
            alert('Answer the question to unlock the check-in button!');
        } else {
            // console.log(answer);

            const answerJson = JSON.stringify(answer);

            // console.log(answerJson);

            try {
                const headerToSend = process.env.REACT_APP_CUSTOM_REQUEST_HEADER;

                fetch(`/api/users/${user._id}`, {
                    method: "PATCH",
                    body: answerJson,
                    headers: {
                        "Content-Type": "application/json",
                        "x-customrequired-header": headerToSend
                    }
                })
                .then(res => {
                    return res.json();
                })
                .then(response => {
                    const checkInForm = { userId: `${user._id}`, eventId: new URLSearchParams(props.location.search).get('eventId') };
        
                    // console.log(`Here's the form: ${checkInForm.toString()}`);
        
                    return fetch('/api/checkins', {
                        method: "POST",
                        body: JSON.stringify(checkInForm),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => {
                        if (res.ok) {
                            props.history.push('/magicLink');
                        }
                    })
                    .catch(err => console.log(err));
                })                    
                .catch(err => console.log(err));
            } catch (error) {
                console.log(error);
            }
        }
    }

    const submitReturningUserForm = (email) => {
        // First, create a new user in the user collection

        fetch(`/api/users?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                return res.json();
            })
            .then(responseId => {

                const answer = { 
                    attendanceReason: reason
                };

                // const answer = { 
                //     whichProject: project
                // };

                const answerJson = JSON.stringify(answer);

                if (responseId === false) {
                    setIsError(true);
                    setErrorMessage("You haven't checked in with that email. Redirecting home to create a new profile...");

                    setTimeout(() => {
                        props.history.push("/");
                    }, 4000)
                } else {
                    return fetch(`/api/users/${responseId}`, {
                        method: "PATCH",
                        body: answerJson,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => {
                        return res.json();
                    })
                    .then(response => {
                        const checkInForm = { userId: `${response}`, eventId: new URLSearchParams(props.location.search).get('eventId') };

                        // console.log(`Here's the form: ${checkInForm.toString()}`);

                        return fetch('/api/checkins', {
                            method: "POST",
                            body: JSON.stringify(checkInForm),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then(res => {
                            if (res.ok) {
                                props.history.push('/magicLink');
                            }
                        })
                        .catch(err => console.log(err));
                    })                    
                    .catch(err => console.log(err));
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    // function checkIsEmptyField(obj) {
    //     if (!Object.values(obj).some(key => (key !== null && key !== ''))) {
    //         setIsError(true);
    //         setErrorMessage("Please don't leave any fields blank");
    //         setIsFormReady(false);
    //     }  
    // } 
    
    const checkInNewUser = (e) => {
        e.preventDefault();

        const firstAttended = `${month} ${year}`;
            
        // SET all of the user's info from useState objects
        const userForm = { 
            name: { 
                firstName, 
                lastName 
            }, 
            ...formInput,
            newMember,
            firstAttended
        };

        let ready = true;

        try {
            setIsLoading(true);

            if (
                userForm.name.firstName === "" || 
                userForm.name.lastName === "" || 
                userForm.email === "" || 
                userForm.currentRole === "" || 
                userForm.desiredRole === "" || 
                firstAttended === ""
            ) {
                setIsError(true);
                setErrorMessage("Please don't leave any fields blank");
                ready = false;
            } 
            
            const currYear = parseInt(moment().format('YYYY'));
            const currMonth = parseInt(moment().format('MM'));
            const yearJoined = parseInt(year);
            // extra date info needed to be recognized as a date
            const monthJoined = parseInt(moment(month + ' 9, 2020').format('MM')); 
            console.log(currYear, currMonth, yearJoined, monthJoined);
            if(yearJoined > currYear || (yearJoined === currYear && monthJoined > currMonth)) {
                setIsError(true);
                setErrorMessage("You can't set a date in the future... Please try again.");
                ready = false;
            } 

            // console.log(isFormReady);

            // SUBMIT all of the user's info from the userForm object
            if(ready) {
                submitForm(userForm);
            }  

            setIsLoading(false);

        } catch(error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    const checkInReturningUser = (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // v1: Get userId from auth cookie (JWT) => return it in response
            // fetch to create checkin using userId
        
            submitReturningUserForm(formInput.email);

            console.log('Checking in Returning User');

            setIsLoading(false);
        } catch(error) {
            console.log(error);
            setIsLoading(false);
            // setIsError(error);
            // alert(error);
        }
    }

    const checkEmail = (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            fetch('/api/checkuser', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: formInput.email })
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                
                throw new Error(res.statusText);
            })
            .then(resJson => {
                // console.log(resJson);
                setUser(resJson);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            })
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    // function getFormValue() {
    //     if (Object.keys(formInput).includes(questions[0].htmlName.toString())) {
    //         return `{formInput.${questions[0].htmlName.toString()}.toString()}`
    //     } 
    // }

    useEffect(() => {
        fetchQuestions();

    }, []);
    
    return (
        <div className="flex-container">
            {newOrReturning === 'returningUser' ? (
                <div className="check-in-container">
                    <div className="check-in-headers">
                        <h3>Welcome back!</h3>
                    </div>
                    <div className="check-in-form">
                        <form className="form-check-in" autoComplete="off" onSubmit={e => e.preventDefault()}>

                        {/* {questions.length !== 0 && questions.map((question) => {
                            return question.htmlName === 'attendanceReason' && (
                                <div key={question._id} className="form-row">
                                    <div className="form-input-text">
                                        <label htmlFor={question.htmlName}>{question.questionText}</label>
                                        <div className="select-reason">
                                            <select 
                                                name={question.htmlName}
                                                value={reason}
                                                // aria-label="topic"
                                                onChange={handleReasonChange}
                                                required
                                            >
                                            {reasons.map((reason, index) => {
                                                return <option key={index} value={reason}>{reason}</option>
                                            })} 
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })} */}

                        {/* {questions.length !== 0 && questions.map((question) => {
                            return question.htmlName === 'whichProject' && (
                                <div key={question._id} className="form-row">
                                    <div className="form-input-text">
                                        <label htmlFor={question.htmlName}>{question.questionText}</label>
                                        <div className="select-reason">
                                            <select 
                                                name={question.htmlName}
                                                value={project}
                                                // aria-label="topic"
                                                onChange={handleProjectChange}
                                                required
                                            >
                                            {projects.map((project, index) => {
                                                return <option key={index} value={project}>{project}</option>
                                            })} 
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })} */}
                        {user === null || user === false ? (
                            <div className="form-row">
                                <div className="form-input-text">
                                    <label htmlFor="email">What email address did you use to check-in last time?</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formInput.email.toString()}
                                        // aria-label="topic"
                                        onChange={handleInputChange}
                                        aria-label="Email Address"
                                        required
                                    /> 
                                </div>
                                <p>{"(This allows easy use of the app. We'll never sell your data!)"}</p>
                            </div>
                        ) : (
                            null
                        )}

                        {isError && errorMessage.length > 1 ? <div className="error">{errorMessage}</div> : null}
                        {user === false && <div className="error">Try entering your email again.</div>}

                        {user === null || user === false ? (
                            !isLoading ? (
                            <div className="form-row">
                                <div className="form-input-button">
                                    <button type="submit" className="form-check-in-submit" onClick={e => checkEmail(e)}>
                                            ENTER
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="form-row">
                                <div className="form-input-button">
                                    <button type="submit" className="form-check-in-submit block" onClick={e => e.preventDefault()}>
                                            ENTERING...
                                    </button>
                                </div>
                            </div>
                        )) : (
                            null
                        )}

                        {user !== null &&
                        user !== false &&
                        user.attendanceReason === undefined && 
                            questions.map((question) => {
                                return question.htmlName === 'attendanceReason' && (
                                    <div key={question._id} className="form-row">
                                        <div className="form-input-text">
                                            <label htmlFor={question.htmlName}>{question.questionText}</label>
                                            <div className="select-reason">
                                                <select 
                                                    name={question.htmlName}
                                                    value={reason}
                                                    // aria-label="topic"
                                                    onChange={handleReasonChange}
                                                    required
                                                >
                                                {reasons.map((reason, index) => {
                                                    return <option key={index} value={reason}>{reason}</option>
                                                })} 
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {user !== null &&
                        user !== false &&
                        user.currentProject === undefined && 
                            questions.map((question) => {
                                return question.htmlName === 'currentProject' && (
                                    <div key={question._id} className="form-row">
                                        <div className="form-input-text">
                                            <label htmlFor={question.htmlName}>{question.questionText}</label>
                                            <div className="select-reason">
                                                <select 
                                                    name={question.htmlName}
                                                    value={project}
                                                    // aria-label="topic"
                                                    onChange={handleProjectChange}
                                                    required
                                                >
                                                {projects.map((project, index) => {
                                                    return <option key={index} value={project}>{project}</option>
                                                })} 
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {user ? (
                            !isLoading ? (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => submitReturning(e)}>
                                                CHECK IN
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => e.preventDefault()}>
                                                CHECKING IN...
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            null
                        )}
                        
                        {/* {isQuestionAnswered && 
                        reason !== "--SELECT ONE--" && 
                        formInput.email && 
                        formInput.email !== "" 
                            ? (
                                !isLoading ? (
                                    <div className="form-row">
                                        <div className="form-input-button">
                                            <button type="submit" className="form-check-in-submit" onClick={e => checkInReturningUser(e)}>
                                                    CHECK IN
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-row">
                                        <div className="form-input-button">
                                            <button type="submit" className="form-check-in-submit" onClick={e => e.preventDefault()}>
                                                    CHECKING IN...
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : ( 
                                <div className="form-row">
                                    <div className="form-input-button block">
                                        <button type="submit" className="form-check-in-submit block" onClick={e => e.preventDefault()}>
                                                CHECK IN
                                        </button>
                                    </div>
                                </div>
                            )}    */}

                        {/* {isQuestionAnswered && project !== "--SELECT ONE--" && formInput.email && formInput.email !== "" ? (
                            !isLoading ? (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => checkInReturningUser(e)}>
                                                CHECK IN
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => e.preventDefault()}>
                                                CHECKING IN...
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : ( 
                            <div className="form-row">
                                <div className="form-input-button block">
                                    <button type="submit" className="form-check-in-submit block" onClick={e => e.preventDefault()}>
                                            CHECK IN
                                    </button>
                                </div>
                            </div>
                        )} */}
                        </form>
                    </div>
                </div>
            ) : null}

            {newOrReturning === 'newUser' ? (
                <div className="check-in-container">
                    <div className="check-in-headers">
                        <h3>Welcome!</h3>
                        <h4>Tell us a little bit about yourself:</h4>
                    </div>
                    <div className="check-in-form">
                        <form className="form-check-in" autoComplete="off" onSubmit={e => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-input-text">
                                    {/* <label htmlFor="first-name">First Name</label> */}
                                    <input 
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={firstName.toString()}
                                        // aria-label="topic"
                                        onChange={handleFirstNameChange}
                                        aria-label="First Name"
                                        required
                                    /> 
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-input-text">
                                    {/* <label htmlFor="last-name">Last Name</label> */}
                                    <input 
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={lastName.toString()}
                                        // aria-label="topic"
                                        onChange={handleLastNameChange}
                                        aria-label="Last Name"
                                        required
                                    /> 
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-input-text">
                                    {/* <label htmlFor="email">Email Address</label> */}
                                    <input 
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formInput.email.toString()}
                                        // aria-label="topic"
                                        onChange={handleInputChange}
                                        aria-label="Email Address"
                                        required
                                    /> 
                                </div>
                                <p>{"(This allows easy use of the app. We'll never sell your data!)"}</p>
                            </div>

                            {questions.length !== 0 && questions.map((question) => {
                                return question.type === 'text' && (
                                    <div key={question._id} className="form-row">
                                        <div className="form-input-text">
                                            {/* <label htmlFor={question.htmlName}>{question.questionText}</label> */}
                                            <input 
                                                type="text"
                                                name={question.htmlName}
                                                placeholder={question.placeholderText}
                                                value={Object.keys(formInput).includes(question.htmlName) ? formInput[question.htmlName.toString()].toString() : ""}
                                                // aria-label="topic"
                                                onChange={handleInputChange}
                                                required
                                            /> 
                                        </div>
                                    </div>
                                );
                            })}

                            {questions.length !== 0 && questions.map((question) => {
                                return question.type === 'select' && (
                                    <div key={question._id} className="form-row">
                                        <div className="form-input-radio">
                                            <label htmlFor={question.htmlName}>Is this your first time attending a Hack Night?</label>
                                            <div className="radio-buttons">
                                                <input 
                                                    id="radio1"
                                                    type="radio"
                                                    name={question.htmlName}
                                                    value={true}
                                                    // aria-label="topic"
                                                    onChange={handleNewMemberChange}
                                                    defaultChecked
                                                    required
                                                /> 
                                                <label htmlFor="radio1">Yes</label>
                                                <input 
                                                    id="radio2"
                                                    type="radio"
                                                    name={question.htmlName}
                                                    value={false}
                                                    // aria-label="topic"
                                                    onChange={handleNewMemberChange}
                                                /> 
                                                <label htmlFor="radio2">No</label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {newMember === true ? (null) : (
                                questions.length !== 0 && questions.map((question) => {
                                    return question.htmlName === 'attendanceLength' && (
                                        <div key={question._id} className="form-row">
                                            <div className="form-input-text">
                                                <label htmlFor={question.htmlName}>{question.questionText}</label>
                                                <div className="radio-buttons">
                                                    <select 
                                                        name={question.htmlName}
                                                        value={month}
                                                        // aria-label="topic"
                                                        onChange={handleMonthChange}
                                                        required
                                                    >
                                                    {months.map((month, index) => {
                                                        return <option key={index} value={month}>{month}</option>
                                                    })} 
                                                    </select>
                                                    <select 
                                                        name={question.htmlName}
                                                        value={year}
                                                        // aria-label="topic"
                                                        onChange={handleYearChange}
                                                        required
                                                    >
                                                    {years.map((year, index) => {
                                                        return <option key={index} value={year}>{year}</option>
                                                    })}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {isError && errorMessage.length > 1 ? <div className="error">{errorMessage}</div> : null}

                            {!isLoading ? (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => checkInNewUser(e)}>
                                                CHECK IN
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <div className="form-input-button">
                                        <button type="submit" className="form-check-in-submit" onClick={e => e.preventDefault()}>
                                                CHECKING IN...
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    )
};

export default CheckInForm;
