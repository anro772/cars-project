<template>
    <button @click="deleteCar">Delete Car</button>
</template>

<script>
import { db } from '../firebase';

export default {
    props: ['carId'],
    methods: {
        deleteCar() {
            db.collection("cars").doc(this.carId).delete();
        }
    }
}
</script>
