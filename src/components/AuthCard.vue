<template>
  <v-card outlined>
    <v-card-text>
      <v-btn
        v-if="user === null"
        block
        class="white--text"
        color="red"
        :loading="isSigning"
        @click="signIn"
      >
        <v-icon left>mdi-google</v-icon>
        Login with Google
      </v-btn>

      <template v-else>
        <p class="black--text text-body-1 font-weight-regular">
          Welcome,
          <span>{{ userName }}</span>
        </p>

        <v-btn
          v-if="profile"
          block
          class="mb-2"
          color="primary"
          @click="showProfileDialog = true"
        >
          Edit Profile
        </v-btn>

        <v-btn block color="secondary" :loading="isSigning" @click="signOut">
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </template>
    </v-card-text>

    <edit-profile-modal
      v-if="user && profile"
      :initialName="user.user_metadata.full_name"
      :is-new-user="isNewUser"
      :profile="profile"
      v-model="showProfileDialog"
      @signOut="signOut"
      @submitted="profileUpdated"
    />

    <v-overlay absolute :value="isLoadingProfile">
      <v-progress-circular indeterminate size="32"></v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import { User } from '@supabase/supabase-js';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import EditProfileModal from '@/components/EditProfileModal.vue';
import supabase, { fetchProfile, Profile } from '@/plugins/supabase';

@Component({
  components: { EditProfileModal },
})
export default class AuthCard extends Vue {
  @Prop({ default: () => null })
  user!: User | null;

  isSigning = false;
  isLoadingProfile = false;
  isNewUser = false;

  showProfileDialog = false;

  profile: Profile | null = null;

  get userName() {
    if (!this.user) {
      return '';
    }

    if (this.profile?.name) {
      return this.profile.name;
    }

    return this.user.email;
  }

  signIn() {
    this.isSigning = true;

    supabase.auth.signIn({ provider: 'google' });
  }

  async signOut() {
    this.isSigning = true;

    await supabase.auth.signOut();

    this.isSigning = false;
  }

  async fetchProfile(id: string) {
    this.isLoadingProfile = true;

    const { data, error } = await fetchProfile(id);
    if (error || !data) {
      alert('Error, please contact admin (amy.azmim@gmail.com).');
      this.isLoadingProfile = false;
      return;
    }

    this.profile = data;
    if (this.profile.created_at === this.profile.updated_at) {
      this.isNewUser = true;
      this.$nextTick(() => (this.showProfileDialog = true));
    }

    this.isLoadingProfile = false;
  }

  profileUpdated(profile: Profile) {
    this.profile = profile;
    this.showProfileDialog = false;
    this.isNewUser = false;
  }

  @Watch('user')
  onUserChanged(user: User | null) {
    if (user) {
      this.fetchProfile(user.id);
    } else {
      this.profile = null;
    }
  }
}
</script>
