<template>
    <nav class="navbar">
        <div class="nav-links">
            <router-link to="/">Home</router-link>
            <router-link to="/cars">List of Cars</router-link>
            <router-link to="/reviews">Reviews</router-link>
            <router-link v-if="isAuthenticated" to="/cart">Cart</router-link>
            <router-link v-if="isAuthenticated" to="/owned-cars">Owned Cars</router-link>
        </div>

        <div v-if="isAuthenticated" class="account-menu">
            {{ accountName }}
            <div class="dropdown-content">
                <button @click="goToAccount">Profile</button>
                <button @click="logout">Logout</button>
            </div>
        </div>

        <!-- Login Button for unauthenticated users -->
        <div v-else class="buttons">
            <button @click="goToLogin" class="login-button">Login</button>
            <button @click="goToRegister" class="register-button">Register</button>
        </div>

    </nav>
</template>


<script>
export default {
    name: 'AppNavbar',
    computed: {
        isAuthenticated() {
            return this.$store.getters.isAuthenticated;
        }
    },
    data() {
        return {
            accountName: 'Account', // Replace with dynamic account name if needed
        };
    },
    watch: {
        isAuthenticated(newValue) {
            if (newValue) {
                this.fetchAccountName();
            }
        }
    },
    mounted() {
        if (this.isAuthenticated) {
            this.fetchAccountName();
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('userToken'); // Remove token from local storage
            this.$store.dispatch('logout'); // Update the Vuex store
            this.$router.push('/login'); // Redirect to login page
        },
        goToLogin() {
            this.$router.push('/login');
        },
        goToRegister() {
            this.$router.push('/signup');
        },
        goToAccount() {
            this.$router.push('/account');
        },
        fetchAccountName() {
            const token = localStorage.getItem('userToken');
            if (token) {
                fetch('http://localhost:3000/account-name', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch account name');
                        return response.json();
                    })
                    .then(data => {
                        this.accountName = data.accountName;
                    })
                    .catch(error => {
                        console.error('Error fetching account name:', error);
                        // Optionally handle the error, e.g., by logging out the user
                    });
            }
        }
    }
};
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 98%;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #333;
    /* Dark background */
    color: white;
    background-color: #1A1A1D;
    /* Updated background color for a sleek look */
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .5);
    /* Soft shadow for depth */
}

.nav-links {
    display: flex;
}

.nav-links,
.account-menu {
    display: flex;
    align-items: center;
}

.navbar a {
    color: white;
    text-decoration: none;
    margin-right: 20px;
    padding: 5px 10px;
    border-radius: 5px;
    transition: background-color 0.3s, color 0.3s;
}

.navbar a,
.login-button,
.register-button {
    margin: 0 10px;
    transition: all 0.3s ease;
    border-radius: 5px;
    padding: 8px 12px;
}

/* Styling for login button */
.login-button {
    background-color: #007bff;
    /* Keep the primary color */
    color: white;
    border: none;
    cursor: pointer;
}

/* New styles for register button */
.register-button {
    background-color: #28a745;
    /* Greenish shade for differentiation */
    color: white;
    border: none;
    cursor: pointer;
}

.account-menu:hover .dropdown-content,
.dropdown-content button:hover {
    background-color: #f5f5f5;
    /* Lighter shade on hover */
    color: #333;
    /* Dark text for contrast */
}

.register-button:hover {
    background-color: #218838;
}

.login-button:hover {
    background-color: #0056b3;
}


.navbar a:hover {
    background-color: #42b983;
    /* Highlight color on hover */
    color: white;
}

.account-menu {
    position: relative;
    user-select: none;
    /* Make the text non-selectable */
    cursor: pointer;
    /* Change cursor to indicate clickability */
}

.account-menu:hover {
    background-color: #42b983;
    border-radius: 5px;
    padding: 5px 10px;
}

.dropdown-content button {
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s;
    border-radius: 5px;
}

.dropdown-content button:hover {
    background-color: #6b6b6b;
    border-radius: 5px;
}

/* Adjustments for dropdown */
.dropdown-content {
    display: none;
    position: absolute;
    background-color: #ffffff;
    color: #333;
    box-shadow: 0 8px 16px rgba(0, 0, 0, .1);
    border-radius: 5px;
    right: 0;
    top: 100%;
    /* Ensure it drops down right below the account menu */
}

.account-menu:hover .dropdown-content {
    display: block;
}

.dropdown-content button {
    width: 100%;
    padding: 10px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
}

.dropdown-content button:hover {
    background-color: #f5f5f5;
}

body {
    margin-top: 60px;
    /* Adjust based on navbar height */
}

.login-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.login-button:hover {
    background-color: #0056b3;
}
</style>
