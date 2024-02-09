<template>
    <div v-if="visible" class="toast" :class="type">
        {{ currentMessage }} <!-- Ensure this renders the message -->
    </div>
</template>

<script>
export default {
    props: {
        message: String,
        type: {
            type: String,
            default: 'success' // can be 'success', 'error', etc.
        }
    },
    data() {
        return {
            visible: false,
        };
    },
    methods: {
        showToast(message, duration = 3000) {
            console.log("Toast message:", message); // Debugging line
            this.currentMessage = message;
            this.visible = true;
            setTimeout(() => {
                this.visible = false;
            }, duration);
        }
    }
};
</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    background-color: green;
    transition: all 0.3s ease;
    z-index: 1000;
}

.toast.error {
    background-color: red;
}

/* Additional styling for other types can be added here */
</style>
