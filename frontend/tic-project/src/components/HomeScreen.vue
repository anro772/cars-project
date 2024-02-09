<template>
  <div class="car-image">
    <div class="home-container">
      <section class="hero">
        <h1>Welcome to CarBuddy</h1>
        <p>Your ultimate destination for finding your next car.</p>
      </section>

      <section class="stats" v-if="carStats.totalCars">
        <div class="stats-item">
          <span class="stats-number">{{ displayedTotalCars }}</span>
          <span class="stats-label">Total Cars</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ displayedUniqueBrands }}</span>
          <span class="stats-label">Unique Brands</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">${{ displayedTotalValue.toLocaleString() }}</span>
          <span class="stats-label">Total Value</span>
        </div>
      </section>

      <section v-else>
        <p>Loading car statistics...</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeScreen',
  data() {
    return {
      carStats: {
        totalCars: null,
        uniqueBrands: [],
        totalValue: 0,
      },
      displayedTotalCars: 0,
      displayedUniqueBrands: 0,
      displayedTotalValue: 0,
    };
  },
  mounted() {
    this.fetchCarStats();
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('home-page-active');
  },

  watch: {
    'carStats.totalCars'(newVal) {
      this.animateValue('displayedTotalCars', 0, newVal, 1300);
    },
    'carStats.uniqueBrands'(newVal) {
      this.animateValue('displayedUniqueBrands', 0, newVal.length, 5000);
    },
    'carStats.totalValue'(newVal) {
      this.animateValue('displayedTotalValue', 0, newVal, 2000);
    },
  },
  methods: {
    fetchCarStats() {
      fetch('http://localhost:3000/cars')
        .then(response => response.json())
        .then(data => {
          this.carStats.totalCars = data.length;
          this.carStats.uniqueBrands = [...new Set(data.map(car => car.make))];
          this.carStats.totalValue = data.reduce((acc, car) => acc + car.price, 0);
        })
        .catch(error => console.error('Error:', error));
    },
    animateValue(ref, start, end, duration) {
      if (start === end) return;
      let range = end - start;
      // Adjust the increment based on the total range to speed up the animation for large numbers
      let increment = range / (duration / 50); // Example: for a 500ms duration, this makes larger increments for larger numbers
      increment = increment > 0 ? Math.ceil(increment) : Math.floor(increment); // Ensure increment is a whole number
      let current = start;

      let timer = setInterval(() => {
        current += increment;
        // Ensure current does not exceed end due to increment jumps
        if ((increment > 0 && current > end) || (increment < 0 && current < end)) {
          current = end;
        }
        this[ref] = current;
        if (current === end) {
          clearInterval(timer);
        }
      }, 50); // Run the update every 50ms for smoother animation
    }
  },
  beforeUnmount() {
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.overflow = ''; // Reset scrolling
    document.body.classList.remove('home-page-active');
  }
};
</script>


<style scoped>
.home-container {
  text-align: center;
  margin: auto;
  padding: 20px;
  max-width: 600px;
}

.car-image {
  background-image: url('../assets/car.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  width: 100vw;
  margin: 0;
  overflow: hidden;
  margin-top: -6px;
}

.home-page-active {
  overflow: hidden !important;
}

.hero {
  background-color: #007bff;
  color: #fff;
  padding: 40px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stats-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-number {
  display: block;
  font-size: 2em;
  font-weight: bold;
}

.stats-label {
  display: block;
  margin-top: 10px;
  font-size: 1em;
  color: #6c757d;
}
</style>
