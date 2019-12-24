#ifndef VIDEO_PLAYER_H
#define VIDEO_PLAYER_H

#ifdef __cplusplus
extern "C" {
#endif

#include <mpv/client.h>
#include <mpv/render_gl.h>

Uint32 wakeup_on_mpv_render_update, wakeup_on_mpv_events;

void die(const char *msg);

void initialize_mpv();

mpv_handle *mpv;
mpv_render_context *mpv_gl;

int redraw;
void mpv_events(SDL_Event event);
void mpv_redraw(SDL_Window *window);

void mpv_input();

void mpv_play_pause();
int position, duration;



#ifdef __cplusplus
}
#endif

#endif