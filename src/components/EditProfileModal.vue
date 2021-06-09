<template>
  <v-dialog persistent max-width="500" v-model="dialog">
    <v-card>
      <v-card-title>Edit Profile</v-card-title>

      <v-card-text>
        <p v-if="isNewUser" class="black--text">
          Hey, looks like you are a new user. Before continuing, please update
          your profile information in the form below.
        </p>

        <v-form v-model="isValid">
          <v-text-field
            :counter="255"
            label="Name"
            :rules="nameRules"
            v-model="form.name"
          />

          <v-dialog
            offset-y
            :close-on-content-click="false"
            width="290px"
            transition="scale-transition"
            v-model="colorDialog"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                readonly
                label="Event color"
                :rules="colorRules"
                v-bind="attrs"
                v-model="form.color"
                v-on="on"
              >
                <template #prepend>
                  <div
                    :style="{
                      height: '20px',
                      width: '20px',
                      background: form.color,
                      'border-radius': '20px',
                    }"
                  ></div>
                </template>
              </v-text-field>
            </template>

            <v-color-picker dot-size="20" v-model="form.color"></v-color-picker>

            <v-btn color="primary" @click="colorDialog = false">OK</v-btn>
          </v-dialog>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text @click="cancel">
          <span v-if="isNewUser">Cancel and Logout</span>
          <span v-else>Cancel</span>
        </v-btn>

        <v-btn color="primary" @click="submit" :loading="isSubmitting">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { hex } from 'wcag-contrast';

import { Profile, updateProfile } from '@/plugins/supabase';

@Component
export default class EditProfileModal extends Vue {
  @Prop({ default: false })
  isNewUser!: boolean;

  @Prop({ default: '' })
  initialName!: string;

  @Prop({ required: true })
  profile!: Profile;

  @Prop({ default: false })
  value!: boolean;

  dialog = false;
  colorDialog = false;

  isValid = false;
  isSubmitting = false;

  form = {
    name: '',
    color: '',
    text_color: '',
  };

  nameRules = [
    (v: string) => !!v || 'Name is required',
    (v: string) => v.length <= 255 || 'Name must be less than 255 characters',
  ];

  colorRules = [
    (v: string) => !!v || 'Color is required',
    (v: string) => v.length === 7 || 'Color must be 7 characters',
    (v: string) => v.startsWith('#') || 'Color must start with "#" character',
  ];

  mounted() {
    this.form.name = this.profile.name;
    this.form.color = this.profile.color;
    this.form.text_color = this.profile.text_color;
    if (this.isNewUser) {
      this.form.name = this.initialName;
    }
  }

  cancel() {
    this.isSubmitting = false;
    this.dialog = false;
    if (this.isNewUser) {
      this.$emit('signOut');
    }
  }

  getTextColor() {
    const black = hex('#000000', this.form.color);
    const white = hex('#FFFFFF', this.form.color);

    return black > white ? '#000000' : '#FFFFFF';
  }

  async submit() {
    if (!this.isValid) {
      return;
    }

    this.isSubmitting = true;

    this.form.text_color = this.getTextColor();
    const { data, error } = await updateProfile(this.form);
    if (!data || error) {
      alert('Error, please contact admin (amy.azmim@gmail.com).');
      this.cancel();
      return;
    }

    this.$emit('submitted', data);

    this.isSubmitting = false;
  }

  @Watch('value')
  onValueChanged(value: boolean) {
    this.dialog = value;
  }

  @Watch('dialog')
  onDialogChanged(dialog: boolean) {
    this.$emit('input', dialog);
  }
}
</script>
