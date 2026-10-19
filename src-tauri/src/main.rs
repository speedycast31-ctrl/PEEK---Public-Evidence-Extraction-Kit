#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

use tauri_plugin_updater::UpdaterExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Let the window settle in before phoning home for updates.
                std::thread::sleep(Duration::from_secs(3));
                match try_update(&handle).await {
                    Ok(Some(version)) => {
                        println!("PEEK updated to v{version}, restarting…");
                        handle.restart();
                    }
                    Ok(None) => println!("PEEK is up to date"),
                    Err(err) => eprintln!("updater: {err}"),
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running PEEK");
}

/// Checks the release channel, and if a newer signed build exists,
/// downloads and installs it. The caller restarts the app afterwards.
async fn try_update(
    app: &tauri::AppHandle,
) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let update = app.updater()?.check().await?;
    let Some(update) = update else {
        return Ok(None);
    };
    let version = update.version.clone();
    update
        .download_and_install(|_chunk, _total| {}, || {})
        .await?;
    Ok(Some(version))
}
