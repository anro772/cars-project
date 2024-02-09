<template>
    <div>
        <input v-model="carToUpdate.make">
        <input v-model="carToUpdate.model">
        <input v-model="carToUpdate.year">
        <!-- Add more fields as necessary -->
        <button @click="updateCar">Update Car</button>
    </div>
</template>

<script>
import { db } from '../firebase';

export default {
    props: ['carToUpdate'],
    methods: {
        updateCar() {
            db.collection("cars").doc(this.carToUpdate.id).update(this.carToUpdate);
        }
    }
}
</script>
