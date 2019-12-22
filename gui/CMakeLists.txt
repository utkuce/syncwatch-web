cmake_minimum_required (VERSION 2.6)
project (syncwatchUI)

set(CMAKE_CXX_STANDARD 11)

# source files for the engine
file(GLOB MY_SOURCES "src/*.cpp")
file(GLOB IMGUI_SOURCES "src/imgui/*.cpp")
file(GLOB MPV_SOURCES "src/video_player.c")
add_executable(syncwatchUI ${MY_SOURCES} ${IMGUI_SOURCES} ${MPV_SOURCES})

# opengl libs
set (OpenGL_GL_PREFERENCE "GLVND")
find_package(OpenGL REQUIRED)
target_link_libraries(syncwatchUI ${OPENGL_LIBRARIES})

IF (WIN32)
# Imm32 is required for imgui
# mingw32 should be before SDL2main
    target_link_libraries(syncwatchUI Imm32 mingw32 glew32)
ENDIF()

# sdl2
find_package(SDL2 REQUIRED)
include_directories(${SDL2_INCLUDE_DIRS})
target_link_libraries(syncwatchUI ${SDL2_LIBRARIES})

# mpv
target_link_libraries(syncwatchUI mpv)
