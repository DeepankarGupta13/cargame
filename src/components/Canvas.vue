<template>
    <div class="canvas-container">
        <canvas id="gameCanvas"></canvas>
    </div>
</template>

<script>
import App from '../scripts/App.js';

let stage = {};
export default {
    name: 'Canvas',
    mounted() {
        this.initializeCanvas();
    },
    methods: {
        initializeCanvas() {
            const canvas = document.getElementById('gameCanvas');
            
            const parent = canvas.parentElement;
            const parentPadding = parseInt(
                window.getComputedStyle(parent, null).getPropertyValue('padding-left'),
                10,
            );
            canvas.width = parent.offsetWidth - (2 * parentPadding);
            canvas.height = parent.offsetHeight - (2 * parentPadding);

            stage = new App();
            stage.loadStage(canvas);
            // Initialize your canvas context here
        }
    }
}
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
</style>