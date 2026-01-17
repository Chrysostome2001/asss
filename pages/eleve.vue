<template>
    <v-app>
      <v-navigation-drawer
        v-model="drawer"
        app
        color="primary"
        style="position: fixed; height: 100vh; overflow-y: auto;"
      >
        <v-list dense>
          <v-list-item class="d-flex align-center justify-center">
            <v-avatar size="150">
              <v-img
                alt="Profile Image"
                v-if="eleve.photo" :src="`data:image/jpeg;base64,${eleve.photo}`"
              ></v-img>
            </v-avatar>
          </v-list-item>
          <v-list-item class="d-flex justify-center">
            <v-list-item-title class="text-white font-weight-bold">{{ eleve.username }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item link>
          <nuxt-link to="/" class="no-decoration" @click="selectedItem = 'Acceuil'">
            <v-list-item-content>
              <v-list-item-title :class="{ 'selected-title': selectedItem === 'Acceuil' }">
                <v-icon color="orange">mdi-home</v-icon> Accueil
              </v-list-item-title>
            </v-list-item-content>
          </nuxt-link>
        </v-list-item>

        <v-list-item
          v-for="item in menuItems"
          :key="item.name"
          link
          @click="changeView(item)"
        >
          <v-list-item-content>
            <v-list-item-title :class="{ 'selected-title': selectedItem === item.name }">
              <v-icon :color="item.iconColor">{{ item.icon }}</v-icon> {{ item.label }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        </v-list>
        <v-footer padless class="v-navigation-footer bg-primary">
        <v-col class="text-center" cols="12">
          <span>{{ eleve.fullName }}</span>
        </v-col>
      </v-footer>
      </v-navigation-drawer>
      
      <v-app-bar app>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-blue lighten-3">E-NOTE</v-toolbar-title>
        <v-btn outlined @click="logout" class="ml-2" color="error">
          Deconnexion
          <v-icon right class="ml-1">mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>
      
      <v-main class="neutral-background" style="overflow-y: auto;">
        <component :is="currentView" />
        <router-view />
      </v-main>
    </v-app>
  </template>
  
  <script>
  import axios from 'axios';
  import HomeEleve from '~/components/HomeEleve.vue';
  import About from '~/components/About.vue';
  import Compte from '~/components/Compte.vue';
  import VoirAvis from '~/components/VoirAvis.vue';
  import DashboardEleve from '@/components/DashboardEleve';
  import { jwtDecode } from 'jwt-decode';
  export default {
    data() {
      return {
        id: null,
        eleve: {},
        drawer: true,
        currentView: 'HomeEleve',
        selectedItem: 'HomeEleve',
        menuItems: [
          { name: 'Notes', label: 'Consulter note', component: 'DashboardEleve', icon: 'mdi-school', iconColor: 'green' },
          { name: 'Avis', label: 'Avis des profs', component: 'VoirAvis', icon: 'mdi-comment-text-outline', iconColor: 'green' },
          { name: 'Compte', label: 'Compte', component: 'Compte', icon: 'mdi-account-circle', iconColor: 'blue' },
          { name: 'HomeEleve', label: 'Aide', component: 'HomeEleve', icon: 'mdi-information-outline', iconColor: 'blue' },
        ],
      };
    },
    components: {
      HomeEleve,
      About,
      Compte,
      DashboardEleve,
      VoirAvis,
    },
    created() {
      this.fetchData();
    },
    methods: {
  async fetchData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }

      const decodedToken = jwtDecode(token);

      const response = await $fetch(`/api/eleve/${decodedToken.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      this.eleve = {
        id: response.eleve_id,
        fullName: `${response.eleve_nom} ${response.eleve_prenom}`,
        username: response.eleve_username,
        photo: response.eleve_photo
      };

    } catch (error) {
      console.error('Erreur chargement élève:', error);

      if (error?.status === 401) {
        this.$router.push('/login');
      }
    }
  },

  changeView(item) {
    this.currentView = item.component;
    this.selectedItem = item.name;
  },

  logout() {
    localStorage.removeItem('token');
    this.$router.push({ name: 'index' });
  }
}

  };
  </script>
  
  <style scoped>
  .v-navigation-drawer {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .v-navigation-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
    .selected-title {
      color: navajowhite; /* La couleur que vous voulez appliquer au titre sélectionné */
    }
    .no-decoration {
      text-decoration: none; /* Enlève le soulignement */
      color: inherit; /* Utilise la couleur du texte environnant */
    }
    .v-list-item-title {
      font-weight: bold;
    }
    .v-list-item-content {
      display: flex;
      align-items: center;
    }
    .neutral-background {
      background-color: #f5f5f5; /* Couleur de fond neutre (gris clair) */
    }
    .v-app-bar {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>