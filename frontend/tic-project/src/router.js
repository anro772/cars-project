import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from './components/UserLogin.vue';
import UserSignup from './components/UserSignup.vue';
import HomeScreen from './components/HomeScreen.vue'; // Import the Home component
import CarList from './components/ViewCars.vue';
import OwnedCars from './components/OwnedCars.vue';
import Reviews from './components/ReviewsComponent.vue';
import Cart from './components/CartComponent.vue';
import Accoutn from './components/AccountComponent.vue';

const routes = [
    { path: '/', component: HomeScreen },       // Add route for Home
    { path: '/login', component: UserLogin },
    { path: '/signup', component: UserSignup },
    { path: '/cars', component: CarList },
    { path: '/owned-cars', component: OwnedCars },
    { path: '/reviews', component: Reviews },
    { path: '/cart', component: Cart },
    { path: '/account', component: Accoutn },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
