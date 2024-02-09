<template>
    <div class="signup-container">
        <div class="signup-form">
            <h2>Sign Up</h2>
            <input v-model="email" type="email" placeholder="Email" :class="{ 'invalid-input': !isEmailValid }"
                class="signup-input">
            <input v-model="password" type="password" placeholder="Password" class="signup-input">
            <button @click="signup" class="register-button">Sign Up</button>
            <button @click="goToHome" class="home-button">Back to Home</button>
        </div>
    </div>
    <toast ref="toast"></toast>
</template>


<style scoped>
.signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: auto;
}

.signup-form h2 {
    margin-top: 0;
}

.signup-form {
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
}

.signup-input {
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    border: 2px solid #007bff;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 16px;
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

.register-button:hover {
    background-color: #218838;
}

.home-button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 15px;
    background-color: #6c757d;
    color: white;
}

.home-button:hover {
    background-color: #565e64;
}

.invalid-input {
    border-color: red;
}
</style>



<script>
import { auth } from '../firebase';
//import { createUserWithEmailAndPassword } from 'firebase/auth';
import router from '../router'; // Import the router
import store from '../store'; // Import the store
import { signInWithEmailAndPassword } from 'firebase/auth';
import ToastComponent from './ToastComponent.vue';


export default {
    components: {
        Toast: ToastComponent
    },
    data() {
        return {
            email: '',
            password: '',
            isEmailValid: true
        };
    },
    methods: {
        signup() {
            // Reset email validity state
            this.isEmailValid = true;

            if (!this.email) {
                alert('Email is required.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.isEmailValid = false; // Set email validity to false
                alert('Please enter a valid email address.');
                return;
            }

            if (this.password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            fetch('http://localhost:3000/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: this.email, password: this.password })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to create user');
                    }
                    return response.json();
                })
                .then(() => {
                    // After successful account creation, log in the user
                    return signInWithEmailAndPassword(auth, this.email, this.password);
                })
                .then((loginCredential) => {
                    console.log("User logged in after signup:", loginCredential.user.email);
                    loginCredential.user.getIdToken().then((idToken) => {
                        localStorage.setItem('userToken', idToken);
                        console.log("ID Token:", idToken);
                        this.$refs.toast.showToast("Signup and login successful!");
                        store.dispatch('login', idToken); // Use Vuex store to dispatch login
                        router.push('/'); // Redirect to the home screen
                    });
                })
                .catch((error) => {
                    console.error("Error during signup or login:", error.message);
                    this.$refs.toast.showToast(error.message);
                });
        },
        goToHome() {
            router.push('/'); // Redirect to home screen
        }
    }
};
</script>
