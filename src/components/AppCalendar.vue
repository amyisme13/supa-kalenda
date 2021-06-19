<template>
  <div v-resize="onResize">
    <div
      v-if="isFetchingEvents"
      style="position: fixed; left: 0; width: 100%; top: 0"
    >
      <v-progress-linear indeterminate />
    </div>

    <full-calendar ref="calendar" :options="calendarOptions" />

    <event-form-modal ref="eventDialog" :user="user" />
  </div>
</template>

<script lang="ts">
import FullCalendar, {
  Calendar,
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventInput,
  EventSourceFunc,
} from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { RealtimeSubscription, User } from '@supabase/supabase-js';
import { addDays } from 'date-fns';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import EventFormModal from '@/components/EventFormModal.vue';
import supabase, { fetchEvents, Profile } from '@/plugins/supabase';

@Component({
  components: { FullCalendar, EventFormModal },
})
export default class AppCalendar extends Vue {
  @Prop({ default: null })
  user!: User | null;

  isFetchingEvents = false;
  users: Map<string, Profile> = new Map();

  listeners: RealtimeSubscription[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, listPlugin, timeGridPlugin],
    dayMaxEvents: true,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listMonth',
    },

    selectable: true,
    select: this.handleDateSelect,
    eventClick: this.handleEventClick,

    loading: this.setLoading,
    events: this.fetchEvents,
  };

  get calendarApi() {
    return (this.$refs.calendar as any).getApi() as Calendar;
  }

  get eventDialog() {
    return this.$refs.eventDialog as any;
  }

  mounted() {
    this.onResize('mount');
    this.setupListeners();
  }

  beforeDestroy() {
    this.listeners.forEach((listener) => listener.unsubscribe());
  }

  onResize(event: string | UIEvent) {
    // vuetify breakpoint doesnt change fast enough
    // so we have to use setTimeout here
    setTimeout(() => {
      const isSmAndDown = this.$vuetify.breakpoint.xsOnly;
      if (event === 'mount' && isSmAndDown) {
        this.calendarApi.changeView('listMonth');
      }

      this.calendarOptions.selectable = !!this.user;

      this.calendarOptions.footerToolbar = {
        center: isSmAndDown ? 'prev,next today' : undefined,
      };

      this.calendarOptions.headerToolbar = {
        ...this.calendarOptions.headerToolbar,
        left: isSmAndDown ? undefined : 'prev,next today',
      };
    }, 250);
  }

  setupListeners() {
    const onUpdate = () => this.calendarApi.refetchEvents();
    const usersListener = supabase
      .from('users')
      .on('UPDATE', onUpdate)
      .subscribe();

    const eventsListener = supabase
      .from('events')
      .on('*', onUpdate)
      .subscribe();

    this.listeners.push(usersListener, eventsListener);
  }

  setLoading(loading: boolean) {
    this.isFetchingEvents = loading;
  }

  async fetchEvents(event: Parameters<EventSourceFunc>[0]) {
    const { data, error } = await fetchEvents(event.startStr, event.endStr);

    if (error || !data) {
      alert('Error, please contact admin (amy.azmim@gmail.com).');
      return [];
    }

    return data.map((v): EventInput => {
      this.users.set(v.creator.id, v.creator);

      let end = new Date(v.end);
      if (v.all_day) {
        end = addDays(end, 1);
      }

      return {
        id: v.id.toString(),
        title: v.title,
        allDay: v.all_day,
        start: v.start,
        end: end,
        color: v.creator.color,
        textColor: v.creator.text_color,
        extendedProps: v,
      };
    });
  }

  handleDateSelect(e: DateSelectArg) {
    if (this.eventDialog) {
      this.eventDialog.openNew(e);
    }
  }

  handleEventClick(e: EventClickArg) {
    if (this.eventDialog) {
      this.eventDialog.openEdit(e.event.extendedProps);
    }
  }

  @Watch('user')
  onUserChanged() {
    this.calendarOptions.selectable = !!this.user;
  }
}
</script>

<style>
.fc {
  font-size: 14px;
}

.fc .fc-button .fc-icon {
  vertical-align: bottom;
}
</style>
