import { google } from 'googleapis';
import path from 'path';

import { Event, Profile } from './supabase';

// TODO: Find a way to put this file into heroku
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../../supa-kalenda-39f4772ff37f.json'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const calendarId = 'or3bu7t218211re8gfp9q6kk64@group.calendar.google.com';

export async function insertEvent(event: Event, user: Profile) {
  try {
    await calendar.events.insert({
      calendarId,
      requestBody: {
        start: {
          dateTime: event.start.replace('+00:00', 'Z'),
        },
        end: {
          dateTime: event.end.replace('+00:00', 'Z'),
        },
        summary: `[${user.name}] ${event.title}`,
        id: `supa${event.id}`,
      },
    });
  } catch (err) {
    console.error(err.message);
  }
}

export async function updateEvent(event: Event, user: Profile) {
  try {
    await calendar.events.patch({
      calendarId,
      eventId: `supa${event.id}`,
      requestBody: {
        start: {
          dateTime: event.start.replace('+00:00', 'Z'),
        },
        end: {
          dateTime: event.end.replace('+00:00', 'Z'),
        },
        summary: `[${user.name}] ${event.title}`,
      },
    });
  } catch (err) {
    console.error(err.message);
  }
}

export async function deleteEvent(event: Event) {
  try {
    await calendar.events.delete({
      calendarId,
      eventId: `supa${event.id}`,
    });
  } catch (err) {
    console.error(err.message);
  }
}
