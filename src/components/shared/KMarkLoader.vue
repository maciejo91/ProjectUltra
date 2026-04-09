<template>
  <div
    class="k-mark-loader inline-flex flex-col items-stretch gap-2 shrink-0"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      class="flex items-center justify-center self-center text-foreground shrink-0"
      :class="sizeClass"
    >
      <svg
        class="k-mark-loader__svg block size-full overflow-visible"
        viewBox="0 0 68 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g class="k-mark-loader__k">
          <path
            fill="currentColor"
            d="M15.836 8.13281H9.29999V44.5998H15.836V8.13281ZM42.527 44.5998H34.857L25.862 29.8928H18.837L33.182 8.13281H40.197L29.821 23.8708L42.527 44.5998Z"
          />
        </g>
        <g class="k-mark-loader__wedge k-mark-loader__wedge--bl1">
          <path
            fill="#F90032"
            d="M29.076 44.295L16.186 63.855L12.807 58.347L25.706 38.779L29.076 44.295Z"
          />
        </g>
        <g class="k-mark-loader__wedge k-mark-loader__wedge--tr">
          <path
            fill="#F90032"
            d="M54.605 5.552L38.824 29.477L35.455 23.97L51.226 0.0459995L54.605 5.552Z"
          />
        </g>
        <g class="k-mark-loader__wedge k-mark-loader__wedge--top">
          <path
            fill="#F90032"
            d="M63.941 0L67.32 5.507L59.779 16.935H52.782L63.941 0Z"
          />
        </g>
        <g class="k-mark-loader__wedge k-mark-loader__wedge--bl2">
          <path
            fill="#F90032"
            d="M13.027 49.35L3.369 64L0 58.485L6.01199 49.35H13.027Z"
          />
        </g>
      </svg>
    </div>
    <p v-if="showLabel" class="k-mark-loader__label text-sm text-muted-foreground">
      {{ t('common.common.loadingLabel') }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  sizeClass: {
    type: String,
    default: 'size-12'
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const { t } = useI18n()
</script>

<style scoped>
.k-mark-loader__label {
  width: 100%;
  text-align: center;
  transform: translateX(calc(-8 / 68 * 100%));
  animation: k-mark-label-pulse 2.2s ease-in-out infinite;
}

@keyframes k-mark-label-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.38;
  }
}

.k-mark-loader__svg {
  transform-origin: 50% 50%;
  transform-box: fill-box;
  animation: k-mark-stage 2.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.k-mark-loader__k {
  transform-box: fill-box;
  transform-origin: center;
  animation: k-mark-k-grow 2.8s cubic-bezier(0.33, 1, 0.68, 1) infinite;
}

.k-mark-loader__wedge {
  transform-box: fill-box;
  transform-origin: center;
  animation-duration: 2.8s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-iteration-count: infinite;
}

.k-mark-loader__wedge--bl1 {
  animation-name: k-mark-wedge-bl1;
}

.k-mark-loader__wedge--tr {
  animation-name: k-mark-wedge-tr;
}

.k-mark-loader__wedge--top {
  animation-name: k-mark-wedge-top;
}

.k-mark-loader__wedge--bl2 {
  animation-name: k-mark-wedge-bl2;
}

@keyframes k-mark-k-grow {
  0% {
    opacity: 0;
    transform: scale(0.88);
  }
  32% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes k-mark-stage {
  0%,
  76% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 0.35;
    transform: scale(0.82);
  }
  100% {
    opacity: 0;
    transform: scale(0.72);
  }
}

@keyframes k-mark-wedge-bl1 {
  0%,
  25% {
    opacity: 0;
    transform: translate(0, 0) scale(0.86);
  }
  30% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  43% {
    transform: translate(-5px, 8px);
  }
  49% {
    transform: translate(-5px, 8px);
  }
  68% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes k-mark-wedge-bl2 {
  0%,
  27% {
    opacity: 0;
    transform: translate(0, 0) scale(0.86);
  }
  32% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  45% {
    transform: translate(-7px, 10px);
  }
  52% {
    transform: translate(-7px, 10px);
  }
  69% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes k-mark-wedge-tr {
  0%,
  28% {
    opacity: 0;
    transform: translate(0, 0) scale(0.86);
  }
  33% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  44% {
    transform: translate(5px, -8px);
  }
  50% {
    transform: translate(5px, -8px);
  }
  67% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes k-mark-wedge-top {
  0%,
  30% {
    opacity: 0;
    transform: translate(0, 0) scale(0.86);
  }
  36% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  47% {
    transform: translate(6px, -9px);
  }
  54% {
    transform: translate(6px, -9px);
  }
  71% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .k-mark-loader__svg,
  .k-mark-loader__k,
  .k-mark-loader__wedge,
  .k-mark-loader__label {
    animation: none;
  }

  .k-mark-loader__label {
    opacity: 1;
  }

  .k-mark-loader__svg {
    opacity: 1;
    transform: none;
  }

  .k-mark-loader__k {
    opacity: 1;
    transform: none;
  }

  .k-mark-loader__wedge {
    opacity: 1;
    transform: none;
  }
}
</style>
