#ifdef __cplusplus
extern "C" {
#endif

#include <mpv/client.h>
#include <mpv/render_gl.h>

Uint32 wakeup_on_mpv_render_update, wakeup_on_mpv_events;

void die(const char *msg);
void *get_proc_address_mpv(void *fn_ctx, const char *name);
void on_mpv_events(void *ctx);
void on_mpv_render_update(void *ctx);

void initialize_mpv();

mpv_handle *mpv;
mpv_render_context *mpv_gl;

int redraw;
void mpv_events(SDL_Event event);
void mpv_redraw(SDL_Window *window);

void mpv_play_pause();
int position, duration;

#ifdef __cplusplus
}
#endif