<template>
    <div class="reviews-container">
        <!-- Search box only displayed if there are reviews -->
        <div class="search-container">
            <input v-model="searchQuery" type="text" placeholder="Search for a car..." class="search-input">
        </div>

        <!-- Display reviews if available -->
        <template v-if="Object.keys(filteredReviewsByCar).length">
            <div v-for="(groupedReviews, carId) in filteredReviewsByCar" :key="carId" class="car-section">
                <div class="car-header">
                    <img :src="groupedReviews[0].carDetails.photoUrl" alt="Car" class="car-image">
                    <div class="car-info">
                        <h2>{{ groupedReviews[0].carDetails.make }} {{ groupedReviews[0].carDetails.model }}</h2>
                        <div class="car-specs">
                            <span class="car-spec">{{ groupedReviews[0].carDetails.year }}</span>
                            <span class="car-spec car-spec-color"
                                :style="{ backgroundColor: groupedReviews[0].carDetails.color }">
                                {{ groupedReviews[0].carDetails.color }}
                            </span>
                            <span class="car-spec car-price">${{ groupedReviews[0].carDetails.price }}</span>
                            <span class="car-spec average-grade">Average Grade: {{ calculateAverageGrade(groupedReviews) }}
                                &#9733;</span>
                        </div>
                    </div>

                </div>
                <div class="reviews">
                    <div v-for="review in groupedReviews" :key="review.userId" class="review-card">
                        <p class="review-user">Review by {{ getUsername(review.userId) }}:</p>
                        <div class="review-rating">
                            <span v-for="star in 5" :key="star" class="star"
                                :class="{ 'filled': star <= review.grade }">&#9733;</span>
                        </div>
                        <p class="review-text">{{ review.review }}</p>
                    </div>
                </div>

            </div>
        </template>

        <!-- Display message if there are no reviews -->
        <div v-else class="no-reviews-message">
            There are no reviews available.
        </div>
    </div>
</template>




<script>
export default {
    data() {
        return {
            reviews: [],
            users: {},
            reviewsByCar: {},
            searchQuery: '',
            grade: 0
        };
    },
    mounted() {
        this.fetchReviews();
    },
    computed: {
        filteredReviewsByCar() {
            if (!this.searchQuery) {
                return this.reviewsByCar;
            }
            const searchQueryLower = this.searchQuery.toLowerCase();
            const filtered = {};
            for (const [carId, groupedReviews] of Object.entries(this.reviewsByCar)) {
                const carName = `${groupedReviews[0].carDetails.make} ${groupedReviews[0].carDetails.model}`.toLowerCase();
                if (carName.includes(searchQueryLower)) {
                    filtered[carId] = groupedReviews;
                }
            }
            return filtered;
        }
    },
    methods: {
        fetchReviews() {
            fetch("http://localhost:3000/reviews", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.group('Reviews', data);
                    this.groupAndSortReviews(data);
                    // Process user details for each review
                    Object.keys(this.reviewsByCar).forEach(carId => {
                        const reviews = this.reviewsByCar[carId];
                        reviews.forEach(review => {
                            if (!this.users[review.userId]) {
                                this.fetchUserDetails(review.userId);
                            }
                        });
                    });
                })
                .catch(error => console.error('Error:', error));
        },
        groupAndSortReviews(reviews) {
            const groupedReviews = {};
            reviews.forEach(review => {
                const carId = review.carDetails.carId;
                if (!groupedReviews[carId]) {
                    groupedReviews[carId] = [];
                }
                groupedReviews[carId].push(review);
            });
            this.reviewsByCar = groupedReviews; // Update reviewsByCar
        },
        fetchUserDetails(userId) {
            console.log(userId);
            fetch(`http://localhost:3000/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    this.users[userId] = user.email.split('@')[0];
                    this.users = { ...this.users };
                })
                .catch(error => console.error('Error:', error));
        },
        getUsername(userId) {
            return this.users[userId] || 'Loading...';
        },
        checkAuthentication() {
            if (!this.$store.getters.isAuthenticated) {
                alert("Please log in to continue.");
                this.$router.push('/login');
            }
        },
        calculateAverageGrade(reviews) {
            if (reviews.length === 0) return 0;
            const totalGrade = reviews.reduce((acc, review) => acc + review.grade, 0);
            return (totalGrade / reviews.length).toFixed(1); // Keeping one decimal place for the average
        }
    }
};
</script>

<style scoped>
.reviews-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
}

.car-section {
    margin-bottom: 30px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.car-header {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #f0f0f0;
}

.car-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
    margin-right: 20px;
}

.car-info {
    flex-grow: 1;
    text-align: left;
}

.car-info h2 {
    margin: 0;
    color: #007bff;
    font-size: 24px;
}

.car-specs {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.car-spec {
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.car-price {
    font-weight: bold;
    font-size: 18px;
    background-color: #28a745;
}

.reviews {
    padding: 15px;
}

.review-card {
    padding: 15px;
    margin-top: 10px;
    background-color: #f8f8f8;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #007bff;
}

.review-user {
    font-weight: bold;
    color: #333;
}

.review-text {
    margin-top: 5px;
    color: #555;
}

.car-spec-color {
    color: white;
    /* This ensures text is readable on most car colors */
    /* Additional styling if needed */
}

.search-container {
    text-align: center;
    margin-bottom: 20px;
}

.search-input {
    padding: 10px;
    width: 50%;
    max-width: 300px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.no-reviews-message {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
    color: #666;
}

.star {
    color: #bbb;
    font-size: 24px;
    /* Color for empty stars */
}

.star.filled {
    color: #f5d142;
    /* Color for filled stars */
}

.average-grade {
    font-weight: bold;
    color: white;
    font-size: 20px;
    background-color: #f5d142;
    /* Star color */
}
</style>
