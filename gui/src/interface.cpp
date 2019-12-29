#include "interface.h"
#include <iostream>

#include "video_player.h"

int margin = 40;
bool show_info_panel = true;

int slider_position;
int last_mouse_motion;
bool show_interface;

bool fullscreen;

void toggle_fullscreen(SDL_Window* window)
{
    SDL_SetWindowFullscreen(window, fullscreen ? SDL_WINDOW_FULLSCREEN_DESKTOP : 0);
    fullscreen = !fullscreen;
}

void HelpMarker(const char* desc)
{
    ImGui::TextDisabled("(?)");
    if (ImGui::IsItemHovered())
    {
        ImGui::BeginTooltip();
        ImGui::PushTextWrapPos(ImGui::GetFontSize() * 35.0f);
        ImGui::TextUnformatted(desc);
        ImGui::PopTextWrapPos();
        ImGui::EndTooltip();
    }
}

const char* seconds_to_display(int input, char* output)
{
    input = input % (24 * 3600); 
    int hours = input / 3600; 
  
    input %= 3600; 
    int minutes = input / 60 ; 
  
    input %= 60; 
    int seconds = input; 

    if (hours != 0)
        sprintf(output, "%02d:%02d:%02d", hours, minutes, seconds);
    else
        sprintf(output, "%02d:%02d", minutes, seconds);
    return output;
}

std::string torrent_name;
float torrent_progress = 0.0f;
std::string torrent_speed = "0 mb/s";
std::string torrent_time = "unknown";
std::string torrent_peers = "<n>";

std::vector<std::string> peers;
std::string room_link = "not_set";

void set_room_link(const char* rl)
{
    room_link = rl;
}

void set_torrent_info(const char** torrent_info)
{
    torrent_name = torrent_info[1];
    torrent_progress = atof(torrent_info[2]);
    torrent_speed = torrent_info[3];
    torrent_time = torrent_info[4];
    torrent_peers = torrent_info[5];
}

void construct_interface(SDL_Window *window)
{
    show_interface = 1;//io.WantCaptureMouse || SDL_GetTicks() - last_mouse_motion < 2000;

    //ImGui::ShowDemoWindow();
    SDL_ShowCursor(show_interface);

    if (show_info_panel && show_interface)
    {
        ImGui::SetNextWindowPos(ImVec2(margin, margin));
        ImGui::SetNextItemWidth(350);
        ImGui::Begin("Info", 0, ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_AlwaysAutoResize);

        ImGui::Separator();

        ImGui::Text("Room invite link");
        ImGui::Text(room_link.c_str());
        if (ImGui::Button("Copy to clipboard"))
        {
            ImGui::LogToClipboard();
            ImGui::LogText(room_link.c_str());
            ImGui::LogFinish();
        }

        ImGui::Separator();

        ImGui::Text("Video source");

        static char str1[1024] = "";
        ImGui::InputTextWithHint("", "Enter magnet link or url", str1, IM_ARRAYSIZE(str1));
        ImGui::SameLine();
        if (ImGui::Button("Stream"))
        {
            // send to parent process
            std::cout << "source:" << str1 << std::endl;
        }

        ImGui::SameLine();
        HelpMarker("Enter a magnet link or a video url (youtube etc.)\n\
            A complete list of supported sources can be found on\nhttps://ytdl-org.github.io/youtube-dl/supportedsites.html");

        ImGui::Text(torrent_progress != 1.0f ? "Downloading" : "Seeding");
        ImGui::SameLine();
        ImGui::TextDisabled("file (?)");
        if (ImGui::IsItemHovered())
        {
            ImGui::BeginTooltip();
            ImGui::PushTextWrapPos(ImGui::GetFontSize() * 35.0f);
            ImGui::TextUnformatted(torrent_name.c_str());
            ImGui::PopTextWrapPos();
            ImGui::EndTooltip();
        }
        ImGui::SameLine();
        ImGui::Text(std::string((torrent_progress != 1.0f ? "from " : "to ") + std::string(torrent_peers) + " peers").c_str());

        ImGui::ProgressBar(torrent_progress, ImVec2(0.0f, 0.0f));
        ImGui::SameLine();

        ImGui::Text(torrent_progress != 1.0f ? torrent_speed.c_str() : "Done");

        ImGui::Separator();

        ImGui::Text("Connected Peers");
        if (peers.empty())
        {
            ImGui::Text("None");
        }
        else
        {
            for (std::vector<std::string>::iterator it = peers.begin(); it != peers.end(); ++it)
                ImGui::Text((*it).c_str());
        }

        ImGui::End();
    }

    if (show_interface)
    {
        static int volume = 100.0f;

        int width, height;
        SDL_GetWindowSize(window, &width, &height);
        ImGui::SetNextWindowSize(ImVec2(width - margin * 2, 0));
        ImGui::SetNextWindowPos(ImVec2(margin, height - ImGui::GetTextLineHeightWithSpacing() * 2 - margin));

        ImGui::Begin("Media Controls", 0, ImGuiWindowFlags_NoTitleBar);

        if (ImGui::Button("Play/Pause"))
        {
            mpv_play_pause();
        }

        ImGui::SameLine(0, 10);

        if (ImGui::Button("Rewind 10s"))
        {
            mpv_seek("-10", "relative");
        }

        ImGui::SameLine(0, 10);

        char slider_display[99], position_display[99], duration_display[99];
        seconds_to_display(position, position_display);
        seconds_to_display(duration, duration_display);
        sprintf(slider_display, "%s/%s", position_display, duration_display);

        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        if (ImGui::SliderInt("", &slider_position, 0, duration, slider_display))
        {
            //std::cout << "Slider position: " << slider_position << std::endl;
            const char *cmd_seek[] = {"seek", std::to_string(slider_position).c_str(), "absolute", NULL};
            mpv_command_async(mpv, 0, cmd_seek);
        }
        else
        {
            if (ImGui::IsItemDeactivatedAfterEdit)
                slider_position = position;
        }

        ImGui::SetNextItemWidth(100);
        if (ImGui::SliderInt("Volume", &volume, 0, 100))
        {
        }

        ImGui::SameLine(0, 10);

        static bool mute;
        ImGui::Checkbox("Mute", &mute);

        ImGui::SameLine(0, 10);

        if (ImGui::Button("Fullscreen"))
        {
            toggle_fullscreen(window);
        }

        ImGui::SameLine(0, 10);
        ImGui::SetNextItemWidth(150);
        static int subtitle_selection = 0;
        ImGui::Combo("Subtitles", &subtitle_selection, "None\0Subtitle1\0Subtitle2\0\0", 10);
        ImGui::SameLine(0, 10);
        ImGui::Checkbox("Show Info Panel", &show_info_panel);
        ImGui::SameLine(0, 10);
        ImGui::Text("%.1f FPS", ImGui::GetIO().Framerate);

        ImGui::End();
    }
}

void set_fullscreen(bool value)
{
    fullscreen = value;
}

void set_last_mouse_motion(int timestamp)
{
    last_mouse_motion = timestamp;
}