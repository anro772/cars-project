<template>
    <div class="login-container">
        <div class="login-form">
            <h2>Login to Your Account</h2>
            <input v-model="email" type="email" placeholder="Email" class="login-input">
            <input v-model="password" type="password" placeholder="Password" class="login-input">
            <button @click="login" class="login-button">Login</button>
            <button @click="register" class="register-button">Register</button>
            <button @click="goHome" class="home-button">Go to Home</button>
        </div>
    </div>
    <toast ref="toast"></toast>
</template>

<script>
import ToastComponent from './ToastComponent.vue';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import router from '../router'; // Import the router
import store from '../store'; // Import the store

export default {
    components: {
        Toast: ToastComponent
    },
    data() {
        return {
            email: '',
            password: ''
        };
    },
    methods: {
        login() {
            signInWithEmailAndPassword(auth, this.email, this.password)
                .then((userCredential) => {
                    console.log("User logged in:", userCredential.user.email);
                    userCredential.user.getIdToken().then((idToken) => {
                        localStorage.setItem('userToken', idToken);
                        console.log("ID Token:", idToken);
                        this.$refs.toast.showToast("Login successful!");
                        store.dispatch('login', idToken); // Use Vuex store to dispatch login
                    });

                    router.push('/'); // Navigate to the home screen after successful login
                })
                .catch((error) => {
                    this.$refs.toast.showToast(error.message);
                    console.error("Login error:", error.message);
                });
        },
        goHome() {
            router.push('/');
        },
        register() {
            router.push('/signup');
        }
    }
};
</script>


<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* Adjust based on your design preference */
    height: 100vh;
    /* Adjust if necessary to fit content without scrolling */
    overflow: auto;
    /* Change to 'hidden' to strictly prevent scrolling */
}


.login-form h2 {
    margin-top: 0;
    /* Adjust or remove the top margin */
}

.login-form {
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
}

.login-input {
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    border: 2px solid #007bff;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 16px;
}

.login-button,
.home-button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 15px;
}

.login-button {
    background-color: #007bff;
    color: white;
}

.login-button:hover {
    background-color: #0056b3;
}

.home-button {
    background-color: #6c757d;
    color: white;
}

.home-button:hover {
    background-color: #565e64;
}

.register-button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 15px;
    background-color: #28a745;
    color: white;
}
</style>
