<template>
  <v-app app>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" lg="3">
            <h1 class="font-weight-medium text-center mb-4">Supa Kalenda</h1>

            <auth-card v-if="showAuth" :user="user" />
            <users-card class="mt-2" :loading="isLoadingUsers" :users="users" />

            <p class="text-caption mt-2 px-2">
              <a
                href="https://www.privacypolicygenerator.info/live.php?token=SW4Suzy0EfHipMzSegpgJdQRLWGbuial"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <br />
              <a
                href="https://www.termsofservicegenerator.net/live.php?token=VzIDM31aXiuGnSLZMQlBWUDqEM8t0dOm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
            </p>
          </v-col>

          <v-col>
            <app-calendar :user="user" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { RealtimeSubscription, User } from '@supabase/supabase-js';
import { Vue, Component } from 'vue-property-decorator';

import AppCalendar from '@/components/AppCalendar.vue';
import AuthCard from '@/components/AuthCard.vue';
import UsersCard from '@/components/UsersCard.vue';
import supabase, { fetchUsers, Profile } from '@/plugins/supabase';

@Component({
  components: { AppCalendar, AuthCard, UsersCard },
})
export default class App extends Vue {
  user: User | null = null;

  isLoadingUsers = false;
  showAuth = true;

  users: Profile[] = [];
  usersListener: RealtimeSubscription | null = null;

  mounted() {
    this.user = supabase.auth.user();
    supabase.auth.onAuthStateChange(() => {
      this.user = supabase.auth.user();
    });

    this.fetchUsers();

    const params = new URLSearchParams(location.search);
    this.showAuth = !params.has('noauth');
  }

  beforeDestroy() {
    this.usersListener?.unsubscribe();
  }

  async fetchUsers() {
    this.isLoadingUsers = true;

    const { data } = await fetchUsers();
    if (data) {
      this.users = data;
    }

    this.usersListener = supabase
      .from<Profile>('users')
      .on('UPDATE', (payload) => {
        const newUser = payload.new;
        const user = this.users.find((v) => v.id === newUser.id);
        if (!user) {
          this.users.push(newUser);
          return;
        }

        user.name = newUser.name;
        user.color = newUser.color;
        user.text_color = newUser.text_color;
      })
      .subscribe();

    this.isLoadingUsers = false;
  }
}
</script>
