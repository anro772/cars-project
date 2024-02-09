<template>
    <div>
        <input v-model="newCar.make" placeholder="Car Make">
        <input v-model="newCar.model" placeholder="Car Model">
        <input v-model="newCar.year" placeholder="Year">
        <!-- Add more fields as necessary -->
        <button @click="addCar">Add Car</button>
    </div>
</template>

<script>
import { db } from '../firebase';

export default {
    data() {
        return {
            newCar: {
                make: '',
                model: '',
                year: ''
                // Other car details
            }
        };
    },
    methods: {
        addCar() {
            db.collection("cars").add(this.newCar);
            this.newCar = { make: '', model: '', year: '' }; // Reset form
        }
    }
}
</script>
