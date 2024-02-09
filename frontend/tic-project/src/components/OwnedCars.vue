<template>
    <div class="cars-container">
        <!-- Conditionally render content based on whether there are owned cars -->
        <template v-if="ownedCars.length">
            <div v-for="car in paginatedOwnedCars" :key="car.carId" class="car-card" @click="selectCar(car)">
                <img :src="car.photoUrl" alt="Car" class="car-image">
                <div class="car-details">
                    <h3>{{ car.make }} {{ car.model }}</h3>
                    <p>Year: {{ car.year }}</p>
                    <p>Color: {{ car.color }}</p>
                    <p>Price: ${{ car.price }}</p>
                </div>
            </div>

            <!-- Pagination Controls, displayed only if there is more than one page -->
            <div v-if="totalPages > 1" class="pagination-controls">
                <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
                <button v-for="page in totalPages" :key="page" @click="setPage(page)"
                    :class="{ active: currentPage === page }">{{ page }}</button>
                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>
        </template>

        <div v-else class="no-cars-message">
            You do not own any cars.
        </div>

        <!-- Review Modal, displayed when a car is selected -->
        <div v-if="selectedCar" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <button class="close-modal" @click="closeModal">&times;</button>
                <div class="car-details-modal">
                    <img :src="selectedCar.photoUrl" alt="Car" class="car-image-modal">
                    <h3>{{ selectedCar.make }} {{ selectedCar.model }}</h3>
                    <p>Year: {{ selectedCar.year }}</p>
                    <p>Color: {{ selectedCar.color }}</p>
                    <p>Price: ${{ selectedCar.price }}</p>
                </div>
                <div class="star-rating">
                    <span v-for="star in [1, 2, 3, 4, 5]" :key="star" class="star" :class="{ active: star <= grade }"
                        @click="setGrade(star)">
                        &#9733;
                    </span>
                </div>

                <textarea v-model="reviewText" placeholder="Write your review here..." class="review-textarea"></textarea>
                <button @click="submitReview" class="submit-review-button">Submit Review</button>
            </div>
        </div>

    </div>
    <toast ref="toast"></toast>
</template>


<script>
import ToastComponent from './ToastComponent.vue';
export default {
    components: {
        Toast: ToastComponent
    },
    data() {
        return {
            ownedCars: [],
            selectedCar: null,
            reviewText: '', // Text for the review
            currentPage: 1,
            carsPerPage: 10,
            grade: 0
        };
    },
    computed: {
        paginatedOwnedCars() {
            let start = (this.currentPage - 1) * this.carsPerPage;
            let end = start + this.carsPerPage;
            return this.ownedCars.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.ownedCars.length / this.carsPerPage);
        },
    },
    mounted() {
        this.fetchOwnedCars();
    },
    methods: {
        setGrade(star) {
            this.grade = star;
        },
        fetchOwnedCars() {
            fetch("http://localhost:3000/owned-cars", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.ownedCars = data;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
        selectCar(car) {
            this.selectedCar = car;
            this.reviewText = ''; // Reset review text when a new car is selected
            this.grade = 0; // Reset grade when a new car is selected
        },
        closeModal() {
            this.selectedCar = null;
            this.reviewText = '';
        },
        submitReview() {
            if (!this.selectedCar || !this.reviewText.trim()) {
                this.$refs.toast.showToast('Please select a car and write a review.');
                return;
            }

            if (this.grade < 1 || this.grade > 5) {
                this.$refs.toast.showToast('Please select a grade between 1 and 5.');
                return;
            }

            const reviewPayload = {
                carId: this.selectedCar.carId,
                review: this.reviewText,
                grade: this.grade // Include the grade in the payload
            };

            fetch("http://localhost:3000/submit-review", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify(reviewPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    return response.text(); // Handle as text if the response is not JSON
                })
                .then(text => {
                    this.$refs.toast.showToast(text); // Show the toast on success
                    this.selectedCar = null; // Reset selected car and review text
                    this.reviewText = '';
                    this.grade = 0; // Reset grade
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.$refs.toast.showToast("Error submitting review", 5000); // Show the toast for a longer time on error
                });
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        setPage(pageNumber) {
            this.currentPage = pageNumber;
        }
    }
};
</script>


<style scoped>
.cars-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 20px;
}

.car-details,
.car-details-modal {
    padding: 15px;
    text-align: center;
}

.car-image {
    width: 100%;
    /* Full width of the modal */
    height: auto;
    /* Maintain aspect ratio */
    object-fit: cover;
    /* Cover the area without distorting aspect ratio */
    border-radius: 5px;
    /* Optional: for rounded corners */
    margin-bottom: 10px;
    /* Space between image and car details */
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    border: none;
    background: none;
    cursor: pointer;
}

.close-modal:hover {
    color: #007bff;
}

.modal-content {
    position: relative;
    width: 500px;
    /* Adjusted width */
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.car-card {
    width: 300px;
    margin: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.car-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.car-details {
    padding: 15px;
    text-align: center;
}

textarea {
    width: 80%;
    height: 100px;
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.submit-review-button {
    margin-top: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

.submit-review-button:hover {
    background-color: #0056b3;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    width: 100%;
}

.pagination-controls button {
    padding: 5px 10px;
    margin: 0 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-controls button:disabled {
    cursor: default;
    opacity: 0.5;
}

.no-cars-message {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
    color: #666;
}

.car-image-modal {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 5px;
    margin-bottom: 10px;
}

.star-rating {
    display: inline-block;
}

.star {
    cursor: pointer;
    color: #ccc;
    font-size: 24px;
    /* Default color for inactive stars */
}

.star.active {
    color: gold;
    /* Highlight color for active stars */
}
</style>



