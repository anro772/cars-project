<template>
  <div class="sorting-container">
    <!-- Sorting Dropdown -->
    <div class="sorting">
      <label for="sort">Sort by:</label>
      <select id="sort" v-model="sortCriteria" @change="sortCars" class="sorting-select">
        <option value="priceAsc">Price (Low to High)</option>
        <option value="priceDesc">Price (High to Low)</option>
        <option value="year">Year</option>
        <option value="make">Make</option>
      </select>
    </div>
  </div>

  <div class="cars-container">

    <div v-for="car in paginatedCars" :key="car.id" class="car-card" @click="selectCar(car)">
      <img :src="car.photoUrl" alt="Car" class="car-image">
      <div class="car-details">
        <h3>{{ car.make }} {{ car.model }}</h3>
        <p>Year: {{ car.year }}</p>
        <p>Color: {{ car.color }}</p>
        <p>Price: ${{ car.price }}</p>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
      <button v-for="page in totalPages" :key="page" @click="setPage(page)" :disabled="currentPage === page">{{ page
      }}</button>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>

    <!-- Modal -->
    <div v-if="selectedCar" class="modal-overlay" @click="selectedCar = null">
      <div class="modal-content" @click.stop>
        <button class="close-modal" @click="selectedCar = null">&times;</button>

        <div class="car-details">
          <img :src="selectedCar.photoUrl" alt="Car" class="car-image">
          <h3>{{ selectedCar.make }} {{ selectedCar.model }}</h3>
          <p>Year: {{ selectedCar.year }}</p>
          <p>Color: {{ selectedCar.color }}</p>
          <p>Price: ${{ selectedCar.price }}</p>
        </div>
        <button @click="addToCart(selectedCar.id)" class="add-to-cart-button">Add to Cart</button>
      </div>
    </div>
  </div>

  <!-- Login Prompt Modal -->
  <div v-if="showLoginPrompt" class="modal-overlay" @click="showLoginPrompt = false">
    <div class="modal-content" @click.stop>
      <h2>Login Required</h2>
      <p>You need to be logged in to perform this action. Would you like to log in now?</p>
      <div class="modal-actions">
        <button @click="redirectToLogin" class="btn btn-primary">Yes, Log In</button>
        <button @click="showLoginPrompt = false" class="btn btn-secondary">No, Thanks</button>
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
      cars: [],
      selectedCar: null, // Object of the selected car
      showLoginPrompt: false, // Whether to show the login prompt modal
      sortCriteria: 'priceAsc', // Default sorting criteria
      currentPage: 1,
      carsPerPage: 10
    };
  },
  computed: {
    paginatedCars() {
      let start = (this.currentPage - 1) * this.carsPerPage;
      let end = start + this.carsPerPage;
      return this.cars.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.cars.length / this.carsPerPage);
    },
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    fetchCars() {
      fetch("http://localhost:3000/cars")
        .then(response => response.json())
        .then(data => {
          this.cars = data;
          this.sortCarsByPriceAsc();
        });
    },
    selectCar(car) {
      if (this.$store.getters.isAuthenticated) {
        this.selectedCar = car;
      } else {
        this.showLoginPrompt = true; // Show the login prompt modal
      }
    },
    sortCarsByPriceAsc() {
      this.cars.sort((a, b) => a.price - b.price);
    },
    redirectToLogin() {
      this.$router.push('/login');
      this.showLoginPrompt = false; // Close the modal after redirecting
    },
    addToCart(carId) {
      const authToken = this.$store.state.authToken;
      fetch("http://localhost:3000/add-to-cart", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ carId: carId })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          } else {
            return response.text(); // Handle non-JSON responses
          }
        })
        .then(data => {
          this.$refs.toast.showToast("Car added to cart!");
          //close the modal
          this.selectedCar = null;

          console.log("Car added to cart:", data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },
    checkAuthentication() {
      if (!this.$store.getters.isAuthenticated) {
        alert("Please log in to continue.");
        this.$router.push('/login');
      }
    },
    sortCars() {
      switch (this.sortCriteria) {
        case 'priceAsc':
          this.cars.sort((a, b) => a.price - b.price);
          break;
        case 'priceDesc':
          this.cars.sort((a, b) => b.price - a.price);
          break;
        case 'year':
          this.cars.sort((a, b) => a.year - b.year);
          break;
        case 'make':
          this.cars.sort((a, b) => a.make.localeCompare(b.make));
          break;
      }
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
    },
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

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  line-height: 24px;
  width: 30px;
  height: 30px;
  text-align: center;
  border: none;
  background: none;
  cursor: pointer;
}

.close-modal:hover {
  color: #42b983;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  position: relative;
  width: 400px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.car-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.car-details {
  padding: 15px;
  text-align: center;
}

.add-to-cart-button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.add-to-cart-button:hover {
  background-color: #42b983;
}

.sorting label {
  margin-right: 10px;
}

.sorting-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.sorting-select {
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
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

.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #565e64;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}
</style>
