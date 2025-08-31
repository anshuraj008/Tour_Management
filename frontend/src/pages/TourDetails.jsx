import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form } from 'reactstrap';
import { Container, Row, Col, ListGroup } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { calculateAvgRating } from '../utils/avgRating';
import avatar from '../assets/images/avatar.jpg';
import Booking from '../components/Booking/Booking';
import Newsletter from '../shared/Newsletter';
import useFetch from "../hooks/useFetch";
import localTours from '../assets/data/tours';
import { BASE_URL } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import '../styles/tour-details.css';

const TourDetails = () => {
  const { id } = useParams();
  const reviewMsgRef = useRef();
  const [tourRating, setTourRating] = useState(null);
  const { user } = useContext(AuthContext);
  const [validationError, setValidationError] = useState('');
  const localMatch = localTours.find(t => (t._id || t.id) === id) || null;
  const isLikelyMongoId = id && id.length >= 12 && !/[^a-fA-F0-9]/.test(id);
  const fetchUrl = isLikelyMongoId ? `${BASE_URL}/tours/${id}` : null;
  const { data: tourApi, loading, error } = useFetch(fetchUrl);

  // Prefer API when available; otherwise use local data
  const [localTour, setLocalTour] = useState(() => {
    // Check if we have saved reviews for this tour in localStorage
    if (localMatch && !isLikelyMongoId) {
      const savedReviews = localStorage.getItem(`tour_reviews_${id}`);
      if (savedReviews) {
        const parsedReviews = JSON.parse(savedReviews);
        return {
          ...localMatch,
          reviews: [...(localMatch.reviews || []), ...parsedReviews]
        };
      }
    }
    return localMatch;
  });
  const tour = tourApi && Object.keys(tourApi).length ? tourApi : localTour;

  // Destructure tour data if available
  const { photo, title, desc, price, address, reviews, city, distance, maxGroupSize } = tour || {};
  const { avgRating } = calculateAvgRating(reviews);

  // Recalculate average rating when reviews change
  const [currentAvgRating, setCurrentAvgRating] = useState(avgRating);

  useEffect(() => {
    if (reviews) {
      const { avgRating: newAvgRating } = calculateAvgRating(reviews);
      setCurrentAvgRating(newAvgRating);
    }
  }, [reviews, tour]);

  // Update initial rating when tour changes
  useEffect(() => {
    if (tour && tour.reviews) {
      const { avgRating: newAvgRating } = calculateAvgRating(tour.reviews);
      setCurrentAvgRating(newAvgRating);
    }
  }, [tour]);

  // Format date for review display
  const dateFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

  // Handle review submission
  const submitHandler = async (e) => {
    e.preventDefault();
    const reviewText = reviewMsgRef.current.value.trim();

    

    try {
      if (!reviewText || !tourRating) {
        setValidationError('Please enter a review and select a rating.');
        return;
      }
      setValidationError('');
  
      const reviewObj = {
        username: user?.username,
        reviewText,
        rating: tourRating,
      };

             // If this tour is from local dataset (non-Mongo id), append locally and stop
       if (!isLikelyMongoId) {
         reviewMsgRef.current.value = '';
         setTourRating(null);
         if (localTour && Array.isArray(localTour.reviews)) {
           const newReview = {
             _id: Math.random().toString(36).slice(2),
             username: reviewObj.username,
             reviewText: reviewObj.reviewText,
             rating: reviewObj.rating,
             createdAt: new Date().toISOString(),
           };
           
           const updatedTour = {
             ...localTour,
             reviews: [...localTour.reviews, newReview],
           };
           
           // Save to localStorage
           const existingReviews = JSON.parse(localStorage.getItem(`tour_reviews_${id}`) || '[]');
           localStorage.setItem(`tour_reviews_${id}`, JSON.stringify([...existingReviews, newReview]));
           
           setLocalTour(updatedTour);
         }
         alert('Review saved locally for demo data');
         return;
       }

      if (!user) {
        alert('Please Sign in to submit a review');
        return;
      }

      const res = await fetch(`${BASE_URL}/review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewObj),
      });

      const result = await res.json();
      if (!res.ok) {
        return alert(result.message);
      }

      alert(result.message);
      reviewMsgRef.current.value = '';
      setTourRating(null);

             // Optimistically append the new review to the list if using local data
       if (localTour && Array.isArray(localTour.reviews)) {
         const newReview = {
           _id: result.data?._id || Math.random().toString(36).slice(2),
           username: reviewObj.username,
           reviewText: reviewObj.reviewText,
           rating: reviewObj.rating,
           createdAt: new Date().toISOString(),
         };
         
         const updatedTour = {
           ...localTour,
           reviews: [...localTour.reviews, newReview],
         };
         
         // Save to localStorage for API tours as well
         const existingReviews = JSON.parse(localStorage.getItem(`tour_reviews_${id}`) || '[]');
         localStorage.setItem(`tour_reviews_${id}`, JSON.stringify([...existingReviews, newReview]));
         
         setLocalTour(updatedTour);
       }
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tour]);

  return(
    <>
    <section>
      <Container>
        {loading && <h4 className="text-center pt-5">Loading...</h4>}
        {error && <h4 className="text-center pt-5">{error}</h4>}

        {!loading && !error && tour && (
          <Row>
            <Col lg="8">
              <div className="tour_content animate-fade">
                {photo && <img className="animate-fade" src={photo} alt={title} />}
                <div className="tour_info enhanced-copy animate-slide">
                  <h2>{title}</h2>
                                     {/* Average rating out of 5 */}
                   <div className="d-flex align-items-center gap-2 mb-2">
                     {[1,2,3,4,5].map((i) => (
                       <i
                         key={`avg-star-${i}`}
                         className="ri-star-s-fill"
                         style={{ color: i <= Math.round(currentAvgRating || 0) ? '#f5c518' : '#d2d2d2' }}
                       ></i>
                     ))}
                     <span style={{ fontWeight: 600 }}>{currentAvgRating ? `${currentAvgRating}/5` : 'Not Rated'}</span>
                   </div>
                  <p>{desc}</p>
                  <h5>Price: ${price}</h5>
                  <h5>Location: {city}, {distance} km</h5>
                  <h5>Max Group Size: {maxGroupSize}</h5>

                                     <div className="d-flex align-items-center gap-5">
                     <span className="tour_rating d-flex align-items-center gap-1">
                       <i className="ri-star-s-fill" style={{ color: 'black' }}></i>
                       {currentAvgRating !== 0 ? currentAvgRating : ''}
                       {reviews?.length > 0 && <span>{reviews.length}</span>}
                     </span>

                    <span>
                      <i className="ri-map-pin-fill"></i> {address}
                    </span>
                  </div>

                  <div className="tour_extra-details">
                    <span><i className="ri-map-pin-2-line"></i> {city}</span>
                    <span><i className="ri-money-dollar-circle-line"></i> ${price} / per person</span>
                    <span><i className="ri-map-pin-time-line"></i> {distance} km</span>
                    <span><i className="ri-group-line"></i> {maxGroupSize} people</span>
                  </div>

                  <h5>Description</h5>
                  <p>{desc}</p> 
                </div>

                {/*=============== Tour reviews section ========== */}
                <div className="tour_reviews mt-4">
                  <h4>Reviews ({reviews?.length || 0} reviews)</h4>

                  <Form onSubmit={submitHandler}>
                    <div className="d-flex align-items-center gap-3 mb-4 rating_group">
                      <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>Rate this tour:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => setTourRating(star)} 
                          style={{ 
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            color: star <= tourRating ? '#f5c518' : '#d2d2d2',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          <i className="ri-star-s-fill"></i>
                        </span>
                      ))}
                      {tourRating && (
                        <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>
                          ({tourRating}/5)
                        </span>
                      )}
                    </div>

                    <div className="review_input">
                      <input type="text" ref={reviewMsgRef} placeholder="Share your thoughts" required />
                      <button className="btn primary_btn text-white" type="submit">Submit</button>
                    </div>
                    {validationError && (
                      <p style={{ color: 'red', marginTop: '0.5rem' }}>{validationError}</p>
                    )}
                  </Form>

                  <ListGroup className="user_reviews">
                    {reviews?.map((review, idx) => (
                      <div key={review._id || review.id || review.createdAt || idx} className="review_item">
                        <img src={avatar} alt={review.username} />
                        <div className="w-100">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h5>{review.username}</h5>
                              <p>{new Date(review.createdAt).toLocaleDateString('en-US', dateFormatOptions)}</p>
                            </div>
                            <span className="d-flex align-items-center">
                              {review.rating} <i className="ri-star-s-fill"></i>
                            </span>
                          </div>
                          <h6>{review.reviewText}</h6>
                        </div>
                      </div>
                    ))}
                  </ListGroup>
                </div>
              </div>
            </Col>

            <Col lg="4">
              <Booking tour={tour} avgRating={avgRating} />
            </Col>
          </Row>
        )}
    </Container>
      <Newsletter />
    </section>
    </>
  );
};

export default TourDetails;
