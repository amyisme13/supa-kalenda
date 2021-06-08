<template>
  <v-card outlined>
    <v-card-title class="pb-0 pt-2 text-body-1 font-weight-regular">
      Users
    </v-card-title>

    <v-list>
      <v-list-item v-if="users.length === 0">
        <v-list-item-title>No data available.</v-list-item-title>
      </v-list-item>

      <v-list-item v-for="user in users" :key="user.id">
        <v-list-item-avatar height="32px" max-width="32px" min-width="32px">
          <div
            :style="{ height: '100%', width: '100%', background: user.color }"
          ></div>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ user.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-overlay absolute :value="loading">
      <v-progress-circular indeterminate size="32" />
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { Profile } from '@/plugins/supabase';

@Component
export default class UsersCard extends Vue {
  @Prop({ default: () => [] })
  users!: Profile[];

  @Prop({ default: false })
  loading!: boolean;
}
</script>
