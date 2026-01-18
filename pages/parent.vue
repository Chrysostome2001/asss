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
                v-if="parent.photo" :src="`data:image/jpeg;base64,${parent.photo}`"
              ></v-img>
            </v-avatar>
          </v-list-item>
          <v-list-item class="d-flex justify-center">
            <v-list-item-title class="text-white font-weight-bold">{{ parent.username }}</v-list-item-title>
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
                <v-icon :color="item.iconColor">{{ item.icon }}</v-icon> 
                <!-- Ajout de la notification pour Avis des profs -->
                <template v-if="item.name === 'VoirAvis'">
                  <v-badge
                    v-if="newAvisCount > 0"
                    :content="newAvisCount"
                    color="red"
                    overlap
                  >
                    Avis des profs
                    <v-icon right>mdi-bell</v-icon>
                  </v-badge>
                <template v-else>
                  {{ item.label }}
                </template>
                </template>
                <!-- Ajout de la notification pour les notes -->
                <template v-else-if="item.name === 'Notes'">
                  <v-badge
                    v-if="newNotesCount > 0"
                    :content="newNotesCount"
                    color="red"
                    overlap
                  >
                    Consulter notes
                    <v-icon right>mdi-bell</v-icon>
                  </v-badge>
                  <template v-else>
                    {{ item.label }}
                  </template>
                </template>

                <template v-else>
                  {{ item.label }}
                </template>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
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
        <component :is="componentsMap[currentView]" />
        <router-view />
      </v-main>
    </v-app>
  </template>
  
  <script setup>
    import { jwtDecode } from 'jwt-decode'
    import HomeParent from '~/components/HomeParent.vue'
    import Compte from '~/components/Compte.vue'
    import DashboardParent from '@/components/DashboardParent'
    import VoirAvis from '~/components/VoirAvis.vue'
    
    const drawer = ref(true)
    const currentView = ref('HomeParent')
    const selectedItem = ref('HomeParent')
    
    const parent = ref({})
    const newAvisCount = ref(0)
    const newNotesCount = ref(0)
    
    const menuItems = [
      { name: 'Notes', label: 'Consulter notes', component: 'DashboardParent', icon: 'mdi-school', iconColor: 'green' },
      { name: 'VoirAvis', label: 'Avis des profs', component: 'VoirAvis', icon: 'mdi-comment-text-outline', iconColor: '#00FF00' },
      { name: 'Compte', label: 'Compte', component: 'Compte', icon: 'mdi-account-circle', iconColor: 'blue' },
      { name: 'HomeParent', label: 'Aide', component: 'HomeParent', icon: 'mdi-information-outline', iconColor: 'blue' },
    ]
    
    const componentsMap = {
      HomeParent,
      Compte,
      DashboardParent,
      VoirAvis,
    }
    
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
    
      const decoded = jwtDecode(token)
    
      try {
        // ✅ infos parent
        const parentData = await $fetch(`/api/parent/${decoded.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    
        parent.value = {
          id: parentData.parent_id,
          fullName: `${parentData.parent_nom} ${parentData.parent_prenom}`,
          username: parentData.parent_username,
          photo: parentData.parent_photo,
        }
    
        // ✅ nouveaux avis
        const avis = await $fetch(`/api/parent/${decoded.id}/nouveaux-avis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        newAvisCount.value = avis.nouveauxAvisCount
    
        // ✅ nouvelles notes
        const notes = await $fetch(`/api/parent/${decoded.id}/nouveaux-notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        newNotesCount.value = notes.nouveauxNotesCount
    
      } catch (err) {
        console.error(err)
      }
    }
    
    const changeView = (item) => {
      currentView.value = item.component
      selectedItem.value = item.name
    
      if (item.name === 'VoirAvis') {
        newAvisCount.value = 0
      }
      if (item.name === 'Notes') {
        newNotesCount.value = 0
      }
    }
    
    const logout = () => {
      localStorage.removeItem('token')
      navigateTo('/')
    }
    
    onMounted(fetchData)
</script>
    

<style scoped>
.selected-title {
  color: navajowhite; /* La couleur que vous voulez appliquer au titre sélectionné */
}
.no-decoration {
      text-decoration: none; /* Enlève le soulignement */
      color: inherit; /* Utilise la couleur du texte environnant */
    }
    .neutral-background {
      background-color: #f5f5f5; /* Couleur de fond neutre (gris clair) */
    }
.bg-primary {
  background-color: #1976D2; /* Couleur primaire pour le fond */
}

.no-decoration {
  text-decoration: none; /* Enlève le soulignement */
  color: inherit; /* Utilise la couleur du texte environnant */
}

.text-white {
  color: white; /* Couleur du texte en blanc */
}

.fill-height {
  height: 100vh;
}

.v-list-item {
  border-radius: 8px; /* Coins arrondis pour les éléments de liste */
  transition: background-color 0.3s ease; /* Effet de transition pour la couleur de fond */
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Couleur de fond au survol */
}
.v-list-item-title {
  font-weight: bold;
}
.v-list-item-content {
  display: flex;
  align-items: center;
}
.v-text-field {
  background-color: #fff; /* Fond blanc pour les champs de texte */
}

.v-app-bar {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Ombre légère pour la barre d'application */
}

.v-btn {
  border-radius: 20px; /* Coins arrondis pour le bouton */
}
</style>