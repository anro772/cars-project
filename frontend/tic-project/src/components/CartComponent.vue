<template>
    <div class="cart-container">
        <!-- Check if the cart is empty -->
        <div v-if="cart.length === 0" class="empty-cart">
            <p>Cart is Empty</p>
        </div>

        <!-- Display cart items if cart is not empty -->
        <div v-else>
            <div v-for="car in cart" :key="car.carId" class="cart-item">
                <img :src="car.photoUrl" alt="Car" class="car-image">
                <div class="car-details">
                    <h3>{{ car.make }} {{ car.model }}</h3>
                    <p>Year: {{ car.year }}</p>
                    <p>Price: ${{ car.price }}</p>
                </div>
                <button @click="removeFromCart(car.carId)" class="btn btn-tertiary">Remove from Cart</button>
            </div>

            <!-- Purchase Confirmation Modal -->
            <div v-if="showModal" class="modal-overlay" @click="showModal = false">
                <div class="modal-content" @click.stop>
                    <h2>Confirm Purchase</h2>
                    <p class="modal-delivery-info">Deliver to: {{ address.addressLine }}, {{ address.city }}, {{
                        address.country }}</p>
                    <div class="modal-actions">
                        <button @click="purchaseCars" class="btn btn-primary">Purchase Cars</button>
                        <button @click="showModal = false" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>


            <button @click="confirmPurchase">Checkout</button>
        </div>
    </div>
    <!-- Address Input Modal -->
    <div v-if="showAddressModal" class="modal-overlay" @click="showAddressModal = false">
        <div class="modal-content" @click.stop>
            <h2>Enter Your Address</h2>
            <div class="input-group">
                <input type="text" v-model="newAddress.addressLine" placeholder="Address Line" class="modal-input">
                <input type="text" v-model="newAddress.city" placeholder="City" class="modal-input">
                <input type="text" v-model="newAddress.country" placeholder="Country" class="modal-input">
            </div>
            <div class="modal-actions">
                <button @click="updateUserAddress" class="btn btn-primary">Update Address</button>
                <button @click="showAddressModal = false" class="btn btn-secondary">Cancel</button>
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
            showAddressModal: false,
            newAddress: {
                addressLine: '',
                city: '',
                country: ''
            },
            cart: [], // Array of cars in the cart
            address: null, // User's address
            showModal: false // Control modal visibility
        };
    },
    mounted() {
        this.fetchCartData();
        this.fetchAddress();
    },
    methods: {
        fetchCartData() {
            fetch("http://localhost:3000/cart", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.cart = data;
                })
                .catch(error => console.error('Error:', error));
        },
        fetchAddress() {
            return fetch("http://localhost:3000/address", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.addressLine) {
                        this.address = data;
                        return true; // Address exists
                    } else {
                        this.address = {}; // Reset address
                        return false; // Address does not exist
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    return false; // Address fetch failed
                });
        },
        confirmPurchase() {
            this.fetchAddress().then(hasAddress => {
                if (!hasAddress) {
                    // Open the address input modal
                    this.showAddressModal = true;
                } else {
                    // Show confirmation modal
                    this.showModal = true;
                }
            });
        },
        purchaseCars() {
            fetch("http://localhost:3000/purchase-cars", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ cart: this.cart }) // Send cart data for purchase
            })
                .then(response => {
                    if (!response.ok) {
                        //display the toast
                        this.$refs.toast.showToast('Failed to purchase cars');
                        throw new Error('Failed to purchase cars');
                    }
                    return response.text();
                })
                .then(() => {
                    // Handle successful purchase
                    this.$refs.toast.showToast('Cars purchased successfully');
                    this.cart = []; // Clear the cart
                    this.showModal = false;
                })
                .catch(error => console.error('Error:', error));
        },

        updateUserAddress() {
            fetch("http://localhost:3000/update-address", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify(this.newAddress)
            })
                .then(response => {
                    if (!response.ok) {
                        // If the response is not ok, throw an error with the status text
                        throw new Error(`Failed to update address: ${response.statusText}`);
                    }
                    return response.text(); // Since the response is plain text, use response.text()
                })
                .then(message => {
                    console.log(message); // Log the success message
                    //display toast
                    this.$refs.toast.showToast(message);
                    this.address = this.newAddress; // Update local address
                    this.showAddressModal = false; // Close the address modal
                    this.showModal = true; // Open the purchase confirmation modal
                })
                .catch(error => {
                    //display toast
                    this.$refs.toast.showToast(error.message);
                    console.error('Error:', error);
                    // Optionally, handle the error in the UI
                });
        },

        removeFromCart(carId) {
            fetch("http://localhost:3000/remove-from-cart", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ carId })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to remove car from cart: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(message => {
                    console.log(message);
                    // Display toast
                    this.$refs.toast.showToast('Car removed from cart');
                    // Fetch updated cart data after removal
                    this.fetchCartData();
                })
                .catch(error => {
                    // Display toast for errors
                    this.$refs.toast.showToast(error.message);
                    console.error('Error:', error);
                });
        },

    }
};
</script>

<style scoped>
.cart-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.cart-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    padding: 15px 0;
}

.car-image {
    width: 200px;
    height: 150px;
    object-fit: cover;
    margin-right: 20px;
    border-radius: 4px;
}

.car-details {
    flex-grow: 1;
}

.car-details h3 {
    margin: 0;
    color: #333;
    font-size: 1.1em;
}

.car-details p {
    margin: 5px 0;
    color: #666;
    font-size: 0.9em;
}

button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    margin: 10px 0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0056b3;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    min-width: 300px;
    text-align: center;
}

.modal-content h2 {
    margin-top: 0;
}

.modal-content p {
    margin: 15px 0;
}

.modal-input {
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
}

.modal-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
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

.modal-delivery-info {
    margin: 20px 0;
    line-height: 1.5;
    text-align: center;
}

.btn-tertiary {
    background-color: #dc3545;
    color: white;
}

.btn-tertiary:hover {
    background-color: #bd2130;
}
</style>