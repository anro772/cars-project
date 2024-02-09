<template>
    <div class="account-container">
        <h2>Account Settings</h2>
        <div class="account-form">
            <div>
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="name">
                <button @click="updateName">Update Name</button>
            </div>
            <div>
                <label>Address:</label>
                <input type="text" v-model="address.addressLine" placeholder="Address Line">
                <input type="text" v-model="address.city" placeholder="City">
                <input type="text" v-model="address.country" placeholder="Country">
                <button @click="updateAddress">Update Address</button>
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
            name: '',
            address: {
                addressLine: '',
                city: '',
                country: ''
            }
        };
    },
    mounted() {
        this.fetchAddress();
        this.fetchName();
    },
    methods: {
        fetchAddress() {
            fetch("http://localhost:3000/address", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        this.address = data;
                    }
                })
                .catch(error => console.error('Error:', error));
        },
        fetchName() {
            fetch("http://localhost:3000/name", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch name');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.name) {
                        this.name = data.name;
                        console.log(this.name);
                    }
                })
                .catch(error => console.error('Error:', error));
        },
        updateName() {
            fetch("http://localhost:3000/add-name", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ name: this.name })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update name');
                    }
                    return response.text();
                })
                .then(() => this.$refs.toast.showToast('Name updated successfully'))
                .catch(error => console.error('Error:', error));
        },
        updateAddress() {
            fetch("http://localhost:3000/update-address", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify(this.address)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update address');
                    }
                    return response.text();
                })
                .then(() => this.$refs.toast.showToast('Address updated successfully'))
                .catch(error => console.error('Error:', error));
        }
    }
};
</script>

<style scoped>
.account-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f2f2f2;
}

.account-form {
    max-width: 400px;
    margin: 0 auto;
}

.account-form div {
    margin-bottom: 20px;
}

.account-form label {
    display: block;
    margin-bottom: 5px;
}

.account-form input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
}

.account-form button {
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}
</style>