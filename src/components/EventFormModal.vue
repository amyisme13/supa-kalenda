<template>
  <v-dialog max-width="500" v-model="dialog">
    <v-card>
      <v-card-title>
        <span v-if="isEditing && isEditable">Edit Event</span>
        <span v-else-if="isEditing">View Event</span>
        <span v-else>Create Event</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isValid">
          <v-text-field
            ref="titleInput"
            label="Title"
            :readonly="!isEditable"
            :rules="titleRules"
            v-model="form.title"
          />

          <v-checkbox v-if="isEditable" label="All day" v-model="form.allDay" />

          <v-row dense>
            <v-col :cols="form.allDay ? 12 : 7" :sm="form.allDay ? 6 : 8">
              <v-text-field
                label="Start Date"
                :readonly="!isEditable"
                :rules="dateRules"
                type="date"
                v-model="form.startDate"
              />
            </v-col>

            <v-col v-if="!form.allDay" cols="5" sm="4">
              <v-text-field
                label="Time"
                :readonly="!isEditable"
                :rules="timeRules"
                type="time"
                v-model="form.startTime"
              />
            </v-col>

            <v-col :cols="form.allDay ? 12 : 7" :sm="form.allDay ? 6 : 8">
              <v-text-field
                label="End Date"
                :readonly="!isEditable"
                :rules="dateRules"
                type="date"
                v-model="form.endDate"
              />
            </v-col>

            <v-col v-if="!form.allDay" cols="5" sm="4">
              <v-text-field
                label="Time"
                :readonly="!isEditable"
                :rules="timeRules"
                type="time"
                v-model="form.endTime"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="isEditable && isEditing"
          small
          class="white--text"
          color="red"
          @click="deleteEvent"
        >
          <v-icon left small>mdi-delete</v-icon>
          Delete
        </v-btn>

        <span v-else-if="!isEditable" class="text-caption">
          Created by {{ creator }}
        </span>

        <v-spacer></v-spacer>
        <v-btn color="secondary" text @click="close">Close</v-btn>

        <v-btn
          v-if="isEditable"
          color="primary"
          @click="submit"
          :loading="isSubmitting"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { DateSelectArg } from '@fullcalendar/vue';
import { User } from '@supabase/supabase-js';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Vue, Component, Prop } from 'vue-property-decorator';

import { deleteEvent, Event, upsertEvent } from '@/plugins/supabase';

@Component
export default class EventFormModal extends Vue {
  @Prop({ default: null })
  user!: User | null;

  dialog = false;

  isEditable = false;
  isEditing = false;
  isValid = false;
  isDeleting = false;
  isSubmitting = false;

  creator = '';
  event: Event | null = null;

  form = {
    title: '',
    allDay: true,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  };

  titleRules = [(v: string) => !!v || 'Title is required'];

  dateRules = [
    (v: string) => !!v || 'Date is required',
    (v: string) => v.length === 10 || 'Date must be 10 characters',
  ];

  timeRules = [
    (v: string) => !!v || 'Time is required',
    (v: string) => v.length === 5 || 'Time must be 5 characters',
  ];

  reset() {
    this.isEditing = false;
    this.isEditable = false;
    this.isDeleting = false;
    this.isSubmitting = false;
    this.event = null;
    this.creator = '';
    this.form = {
      title: '',
      allDay: true,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    };

    (this.$refs.form as any)?.resetValidation();
  }

  formatDate(date: Date | string) {
    if (typeof date === 'string') {
      date = new Date(date);
    }

    return format(date, 'yyyy-MM-dd');
  }

  formatTime(date: Date | string) {
    if (typeof date === 'string') {
      date = new Date(date);
    }

    return format(date, 'HH:ss');
  }

  setFormDateTime(start: Date | string, end: Date | string) {
    this.form.startDate = this.formatDate(start);
    this.form.startTime = this.formatTime(start);
    this.form.endDate = this.formatDate(end);
    this.form.endTime = this.formatTime(end);
  }

  openNew(arg?: DateSelectArg) {
    this.reset();
    this.isEditable = true;

    let start = new Date();
    let end = start;
    if (arg) {
      start = arg.start;
      end = arg.end;
      this.form.allDay = arg.allDay;
    }

    this.setFormDateTime(start, end);

    this.dialog = true;
    setTimeout(() => (this.$refs.titleInput as any).focus(), 250);
  }

  openEdit(event: Event) {
    this.reset();
    this.isEditing = true;
    this.isEditable = event.user_id === this.user?.id;
    this.event = event;

    this.form.title = event.title;
    this.form.allDay = event.all_day;
    this.setFormDateTime(event.start, event.end);

    this.creator = event.creator.name;

    this.dialog = true;
    if (this.isEditable) {
      setTimeout(() => (this.$refs.titleInput as any).focus(), 250);
    }
  }

  close() {
    this.reset();
    this.dialog = false;

    this.$emit('close');
  }

  async submit() {
    if (!this.isValid || !this.user) {
      return;
    }

    this.isSubmitting = true;

    let start = new Date(`${this.form.startDate} ${this.form.startTime}`);
    let end = new Date(`${this.form.endDate} ${this.form.endTime}`);
    if (this.form.allDay) {
      start = startOfDay(start);
      end = endOfDay(end);
    }

    const form: Partial<Event> = {
      user_id: this.user.id,
      id: this.event ? this.event.id : undefined,
      title: this.form.title,
      all_day: this.form.allDay,
      start: start.toJSON(),
      end: end.toJSON(),
    };

    const { data, error } = await upsertEvent(form);
    if (!data || error) {
      alert('Error, please contact admin (amy.azmim@gmail.com).');
    }

    this.close();
    this.isSubmitting = false;
  }

  async deleteEvent() {
    if (!this.event) {
      return;
    }

    this.isDeleting = true;

    const confirmed = confirm('Are you sure you wanna delete this event?');
    if (confirmed) {
      await deleteEvent(this.event.id);
      this.close();
    }

    this.isDeleting = false;
  }
}
</script>
