<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import QrPaymentModal from '@/components/QrPaymentModal.vue';
import InvoiceModal from '@/components/InvoiceModal.vue';
import AuthModal from '@/components/AuthModal.vue';

const showAuth = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-gold-500/20 selection:text-gold-950">
    <!-- Navbar -->
    <Navbar v-model:showAuth="showAuth" />

    <!-- Main View Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Global Floating Modals -->
    <QrPaymentModal />
    <InvoiceModal />
    <AuthModal v-if="showAuth" @close="showAuth = false" />
  </div>
</template>
