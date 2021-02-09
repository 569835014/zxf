<template>
    <transition name="el-loading-fade" @after-leave="handleAfterLeave">
        <div
                v-show="visible"
                class="el-loading-mask"
                :style="{ backgroundColor: background || '' }"
                :class="[customClass, { 'is-fullscreen': fullscreen }]">
            <div class="diamond-loading-con" v-show="visible">
                <div class="diamond-loading-group">
                    <div class="loader"><div class="diamond"></div><div class="diamond"></div><div class="diamond"></div></div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "Loading",
        data() {
            return {
                text: null,
                spinner: null,
                background: null,
                fullscreen: true,
                visible: false,
                customClass: ''
            }
        },
        methods: {
            handleAfterLeave() {
                this.$emit('after-leave');
            },
            setText(text) {
                this.text = text;
            }
        }
    }
</script>

<style scoped>

</style>
